import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

interface CampaignPerformanceChartProps {
  data: CampaignPerformance[];
  isLoading?: boolean;
}

const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({ data, isLoading = false }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '캠페인 성과',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: data.map(item => item.campaignName),
    datasets: [
      {
        label: '노출수',
        data: data.map(item => item.impressions),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: '클릭수',
        data: data.map(item => item.clicks),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '전환수',
        data: data.map(item => item.conversions),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  if (isLoading) {
    return <div className="h-80 flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Bar options={options} data={chartData} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">캠페인 비용 요약</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map(campaign => (
            <div key={campaign.campaignId} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{campaign.campaignName}</p>
              <p className="text-sm text-gray-600">비용: ₩{campaign.cost.toLocaleString()}</p>
              <p className="text-sm text-gray-600">
                CPC: ₩{(campaign.cost / campaign.clicks || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignPerformanceChart; 