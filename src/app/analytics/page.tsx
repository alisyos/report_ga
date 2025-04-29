'use client';

import React, { useState, useEffect } from 'react';
import { 
  fetchAnalyticsData, 
  formatPageViewsByDate, 
  formatVisitorsByPage 
} from '@/services/analytics';
import { getCampaignPerformance } from '@/services/googleAds';
import PageViewsChart from '@/components/charts/PageViewsChart';
import VisitorsByPageChart from '@/components/charts/VisitorsByPageChart';
import CampaignPerformanceChart from '@/components/charts/CampaignPerformanceChart';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageViewsData, setPageViewsData] = useState<{ labels: string[], values: number[] }>({ 
    labels: [], 
    values: [] 
  });
  const [visitorsData, setVisitorsData] = useState<{ page: string, count: number }[]>([]);
  const [campaignData, setCampaignData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Google Analytics 데이터 가져오기
        const analyticsData = await fetchAnalyticsData();
        const formattedPageViews = formatPageViewsByDate(analyticsData);
        const formattedVisitors = formatVisitorsByPage(analyticsData);
        
        // Google Ads 데이터 가져오기
        const campaignPerformance = await getCampaignPerformance();
        
        setPageViewsData(formattedPageViews);
        setVisitorsData(formattedVisitors);
        setCampaignData(campaignPerformance);
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error in analytics page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">웹사이트 분석</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <PageViewsChart 
            labels={pageViewsData.labels} 
            values={pageViewsData.values} 
            isLoading={isLoading} 
          />
        </div>
        <div>
          <VisitorsByPageChart 
            visitors={visitorsData} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Google Ads 캠페인 성과</h2>
        <CampaignPerformanceChart 
          data={campaignData}
          isLoading={isLoading}
        />
      </div>
      
      {!isLoading && !error && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">분석 인사이트</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-4">
              지난 7일 동안의 총 페이지뷰: <span className="font-bold">
                {pageViewsData.values.reduce((sum, value) => sum + value, 0)}
              </span>
            </p>
            <p className="mb-4">
              가장 많이 방문한 페이지: <span className="font-bold">
                {visitorsData.length > 0 ? visitorsData[0].page : '데이터 없음'}
              </span>
            </p>
            <p className="mb-4">
              최고 트래픽 날짜: <span className="font-bold">
                {pageViewsData.labels.length > 0 ? 
                  pageViewsData.labels[pageViewsData.values.indexOf(Math.max(...pageViewsData.values))] : 
                  '데이터 없음'
                }
              </span>
            </p>
            {campaignData.length > 0 && (
              <>
                <p className="mb-4">
                  총 광고 비용: <span className="font-bold">
                    ₩{campaignData.reduce((sum, campaign) => sum + campaign.cost, 0).toLocaleString()}
                  </span>
                </p>
                <p>
                  총 전환 수: <span className="font-bold">
                    {campaignData.reduce((sum, campaign) => sum + campaign.conversions, 0).toLocaleString()}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 