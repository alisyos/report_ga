import { NextResponse } from 'next/server';
import { GoogleAdsApi, Customer } from 'google-ads-api';

// 환경 변수 검증
const requiredEnvVars = {
  GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET,
  GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  GOOGLE_ADS_CLIENT_CUSTOMER_ID: process.env.GOOGLE_ADS_CLIENT_CUSTOMER_ID,
};

// 누락된 환경 변수 확인
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

// 매니저 계정인지 클라이언트 계정인지 확인
// 환경 변수 GOOGLE_ADS_LOGIN_CUSTOMER_ID가 설정되어 있으면 매니저 계정으로 간주
const isManagerAccount = !!process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID && 
                         process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID !== process.env.GOOGLE_ADS_CLIENT_CUSTOMER_ID;

let customer: Customer;
if (isManagerAccount) {
  console.log('Using manager account with login_customer_id:', process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  // 매니저 계정을 통해 클라이언트 계정에 접근
  customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CLIENT_CUSTOMER_ID!,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  });
} else {
  console.log('Using client account directly:', process.env.GOOGLE_ADS_CLIENT_CUSTOMER_ID);
  // 직접 클라이언트 계정 접근
  customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CLIENT_CUSTOMER_ID!,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  });
}

export async function GET() {
  try {
    console.log('Fetching Google Ads data...'); // 요청 시작 로깅

    const response = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE campaign.status = 'ENABLED'
      AND segments.date DURING LAST_7_DAYS
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `);

    console.log('Google Ads raw response:', response); // 원본 응답 데이터 로깅

    const formattedData = response.map((row: any) => ({
      campaignId: row.campaign?.id?.toString() || '',
      campaignName: row.campaign?.name || '',
      impressions: Number(row.metrics?.impressions) || 0,
      clicks: Number(row.metrics?.clicks) || 0,
      cost: Number(row.metrics?.cost_micros) / 1000000 || 0,
      conversions: Number(row.metrics?.conversions) || 0,
    }));

    console.log('Google Ads formatted data:', formattedData); // 가공된 데이터 로깅

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Google Ads API Error:', error); // 자세한 에러 로깅
    
    let errorMessage = '데이터를 가져오는 중 오류가 발생했습니다.';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 