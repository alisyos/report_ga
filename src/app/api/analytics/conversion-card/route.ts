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

// 전환카드 리포트 데이터 가져오기
export async function GET(request: Request) {
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

    // URL에서 날짜 범위 매개변수 추출
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '7daysAgo';
    const endDate = searchParams.get('endDate') || 'today';
    const limit = Number(searchParams.get('limit')) || 10;
    const eventFilter = searchParams.get('eventFilter') || ''; // 이벤트 필터 매개변수 추가

    console.log('Google Analytics 전환카드 API 요청 시작...');
    console.log('Property ID:', propertyId);
    console.log('날짜 범위:', startDate, '~', endDate);
    console.log('이벤트 필터:', eventFilter);
    
    // GA4 속성 ID가 이미 "properties/" 접두사를 포함하는지 확인
    const formattedPropertyId = propertyId.startsWith('properties/') 
      ? propertyId 
      : `properties/${propertyId}`;
    
    console.log('Formatted Property ID:', formattedPropertyId);

    // 전환카드 데이터 조회
    const [response] = await analyticsDataClient.runReport({
      property: formattedPropertyId,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [
        {
          name: 'date', // 날짜
        },
        {
          name: 'sessionSource', // 소스
        },
        {
          name: 'sessionMedium', // 매체
        },
        {
          name: 'deviceCategory', // 기기 카테고리
        },
        {
          name: 'eventName', // 이벤트 (문의하기 등)
        },
        {
          name: 'sessionCampaignName', // 세션 캠페인 이름 (검색어)
        },
        {
          name: 'sessionManualTerm', // 세션 수동 검색어
        }
      ],
      metrics: [
        {
          name: 'eventCount', // 이벤트 수
        },
        {
          name: 'sessions', // 세션 수
        },
        {
          name: 'totalUsers', // 사용자 수
        }
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: 'date',
          },
          desc: true, // 최근 날짜부터
        },
        {
          metric: {
            metricName: 'eventCount',
          },
          desc: true, // 이벤트 수 많은 순
        }
      ],
      // 이벤트 필터 추가
      ...(eventFilter ? {
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'CONTAINS',
              value: eventFilter,
              caseSensitive: false
            }
          }
        }
      } : {}),
      limit: limit,
    });

    console.log('Google Analytics 전환카드 API 응답 받음');
    const formattedData = formatResponse(response);
    console.log('전환카드 데이터 항목 수:', formattedData.rows.length);

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
        
        // 좀 더 읽기 쉬운 형식으로 변환
        const formattedRow = {
          date: dimensionValues[0],
          source: dimensionValues[1],
          medium: dimensionValues[2],
          deviceCategory: dimensionValues[3],
          eventName: dimensionValues[4],
          campaignName: dimensionValues[5],
          manualTerm: dimensionValues[6],
          eventCount: Number(metricValues[0]),
          sessions: Number(metricValues[1]),
          users: Number(metricValues[2])
        };
        
        return formattedRow;
      }) || [],
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error formatting response:', error);
    throw new Error('응답 데이터 형식화 중 오류가 발생했습니다.');
  }
} 