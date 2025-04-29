import axios from 'axios';

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export async function getCampaignPerformance(): Promise<CampaignPerformance[]> {
  try {
    console.log('Fetching Google Ads data...'); // 요청 시작 로깅
    const response = await axios.get('/api/google-ads');
    console.log('Google Ads API response:', response.data); // 응답 데이터 로깅
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Ads data:', error);
    if (axios.isAxiosError(error) && error.response) {
      // API에서 반환한 에러 메시지가 있는 경우
      const errorMessage = error.response.data.error || 'Google Ads 데이터를 가져오는 중 오류가 발생했습니다.';
      const errorDetails = error.response.data.details || '';
      console.error('API Error details:', errorDetails);
      throw new Error(errorMessage);
    }
    throw new Error('Google Ads 데이터를 가져오는 중 오류가 발생했습니다.');
  }
} 