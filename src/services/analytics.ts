import axios from 'axios';

interface AnalyticsRow {
  dimensions: string[];
  metrics: string[];
}

interface AnalyticsData {
  dimensions: string[];
  metrics: string[];
  rows: AnalyticsRow[];
}

// Google Analytics 데이터 가져오기
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  try {
    console.log('Fetching analytics data...'); // 요청 시작 로깅
    const response = await axios.get('/api/analytics');
    console.log('Analytics API response:', response.data); // 응답 데이터 로깅
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    if (axios.isAxiosError(error) && error.response) {
      // API에서 반환한 에러 메시지가 있는 경우
      const errorMessage = error.response.data.error || '분석 데이터를 가져오는 중 오류가 발생했습니다.';
      const errorDetails = error.response.data.details || '';
      console.error('API Error details:', errorDetails);
      throw new Error(errorMessage);
    }
    throw new Error('분석 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

// 일별 페이지뷰 데이터 형식화
export function formatPageViewsByDate(data: AnalyticsData) {
  try {
    const pageViewsByDate: Record<string, number> = {};
    
    data.rows.forEach(row => {
      const date = row.dimensions[0]; // 날짜는 첫 번째 차원
      const pageViews = parseInt(row.metrics[0], 10); // 페이지뷰는 첫 번째 지표
      
      // 날짜별로 페이지뷰 합산
      if (pageViewsByDate[date]) {
        pageViewsByDate[date] += pageViews;
      } else {
        pageViewsByDate[date] = pageViews;
      }
    });
    
    // 차트에 사용할 수 있는 배열 형태로 변환
    const labels = Object.keys(pageViewsByDate).sort();
    const values = labels.map(date => pageViewsByDate[date]);
    
    return { labels, values };
  } catch (error) {
    console.error('Error formatting pageviews data:', error);
    return { labels: [], values: [] };
  }
}

// 페이지별 방문자 수 형식화
export function formatVisitorsByPage(data: AnalyticsData) {
  try {
    const visitorsByPage: Record<string, number> = {};
    
    data.rows.forEach(row => {
      const pagePath = row.dimensions[1]; // 페이지 경로는 두 번째 차원
      const visitors = parseInt(row.metrics[1], 10); // 활성 사용자는 두 번째 지표
      
      // 페이지별로 방문자 수 합산
      if (visitorsByPage[pagePath]) {
        visitorsByPage[pagePath] += visitors;
      } else {
        visitorsByPage[pagePath] = visitors;
      }
    });
    
    // 차트에 사용할 수 있는 객체 배열 형태로 변환
    const result = Object.entries(visitorsByPage)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 상위 10개만 표시
    
    return result;
  } catch (error) {
    console.error('Error formatting visitors data:', error);
    return [];
  }
} 