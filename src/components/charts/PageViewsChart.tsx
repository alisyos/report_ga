import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PageViewsChartProps {
  labels: string[];
  values: number[];
  isLoading?: boolean;
}

const PageViewsChart: React.FC<PageViewsChartProps> = ({ labels, values, isLoading = false }) => {
  // 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
  const formattedLabels = labels.map(label => {
    if (label.length === 8) {
      return `${label.substring(0, 4)}-${label.substring(4, 6)}-${label.substring(6, 8)}`;
    }
    return label;
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '일별 페이지뷰',
      },
    },
  };

  const data = {
    labels: formattedLabels,
    datasets: [
      {
        label: '페이지뷰',
        data: values,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  if (isLoading) {
    return <div className="h-80 flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Line options={options} data={data} />
    </div>
  );
};

export default PageViewsChart; 