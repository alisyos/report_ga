import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 환경 변수에서 인증 정보 가져오기
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
const propertyId = process.env.GA_PROPERTY_ID;

// Google Analytics Data API 클라이언트 생성
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  if (!credentialsJson || !propertyId) {
    throw new Error('Google Analytics API 인증 정보 또는 속성 ID가 설정되지 않았습니다.');
  }

  console.log('Credentials JSON:', credentialsJson.substring(0, 100) + '...'); // 처음 100자만 로깅

  // JSON 문자열을 객체로 변환
  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (parseError) {
    console.error('JSON 파싱 오류:', parseError);
    console.error('잘못된 JSON 형식입니다. 모든 속성 이름은 큰따옴표로 둘러싸여 있어야 합니다.');
    throw new Error('인증 정보 JSON 형식이 올바르지 않습니다.');
  }
  
  // 클라이언트 생성
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials,
  });
} catch (error) {
  console.error('Google Analytics 클라이언트 초기화 오류:', error);
}

// 지난 7일간 페이지 뷰 데이터 가져오기
export async function GET() {
  try {
    if (!analyticsDataClient) {
      return NextResponse.json(
        { error: 'Google Analytics 클라이언트가 초기화되지 않았습니다.' },
        { status: 500 }
      );
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Google Analytics 속성 ID가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('Google Analytics API 요청 시작...');
    console.log('Property ID:', propertyId);
    
    // GA4 속성 ID가 이미 "properties/" 접두사를 포함하는지 확인
    const formattedPropertyId = propertyId.startsWith('properties/') 
      ? propertyId 
      : `properties/${propertyId}`;
    
    console.log('Formatted Property ID:', formattedPropertyId);

    // 지난 7일간의 페이지뷰 조회
    const [response] = await analyticsDataClient.runReport({
      property: formattedPropertyId,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
        {
          name: 'activeUsers',
        },
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: 'date',
          },
          desc: false,
        },
        {
          metric: {
            metricName: 'screenPageViews',
          },
          desc: true,
        },
      ],
    });

    console.log('Google Analytics API 응답 받음');
    const formattedData = formatResponse(response);
    console.log('GA Response:', formattedData);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Google Analytics API Error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : '알 수 없는 오류');
    
    return NextResponse.json(
      { 
        error: '데이터를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// 응답 데이터 형식화 함수
function formatResponse(response: any) {
  try {
    const dimensions = response.dimensionHeaders?.map((header: any) => header.name) || [];
    const metrics = response.metricHeaders?.map((header: any) => header.name) || [];
    
    const formattedData = {
      dimensions,
      metrics,
      rows: response.rows?.map((row: any) => {
        const dimensionValues = row.dimensionValues?.map((value: any) => value.value) || [];
        const metricValues = row.metricValues?.map((value: any) => value.value) || [];
        
        return {
          dimensions: dimensionValues,
          metrics: metricValues,
        };
      }) || [],
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error formatting response:', error);
    throw new Error('응답 데이터 형식화 중 오류가 발생했습니다.');
  }
}

// 유입경로 데이터 가져오기
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateRange = { startDate: '7daysAgo', endDate: 'today' } } = body;
    
    if (!analyticsDataClient) {
      return NextResponse.json(
        { error: 'Google Analytics 클라이언트가 초기화되지 않았습니다.' },
        { status: 500 }
      );
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Google Analytics 속성 ID가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('Google Analytics 유입경로 API 요청 시작...');
    console.log('Property ID:', propertyId);
    
    // GA4 속성 ID가 이미 "properties/" 접두사를 포함하는지 확인
    const formattedPropertyId = propertyId.startsWith('properties/') 
      ? propertyId 
      : `properties/${propertyId}`;
    
    console.log('Formatted Property ID:', formattedPropertyId);

    // 유입경로 데이터 조회 (트래픽 소스 별 세션 및 사용자 수)
    const [response] = await analyticsDataClient.runReport({
      property: formattedPropertyId,
      dateRanges: [
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      ],
      dimensions: [
        {
          name: 'sessionSource',
        },
        {
          name: 'sessionMedium',
        },
      ],
      metrics: [
        {
          name: 'sessions',
        },
        {
          name: 'totalUsers',
        },
        {
          name: 'newUsers',
        },
      ],
      orderBys: [
        {
          metric: {
            metricName: 'sessions',
          },
          desc: true,
        },
      ],
    });

    console.log('Google Analytics 유입경로 API 응답 받음');
    const formattedData = formatResponse(response);
    console.log('GA Traffic Source Response:', formattedData);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Google Analytics API Error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : '알 수 없는 오류');
    
    return NextResponse.json(
      { 
        error: '데이터를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 