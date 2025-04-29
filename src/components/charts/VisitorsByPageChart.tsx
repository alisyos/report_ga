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

interface PageVisitor {
  page: string;
  count: number;
}

interface VisitorsByPageChartProps {
  visitors: PageVisitor[];
  isLoading?: boolean;
}

const VisitorsByPageChart: React.FC<VisitorsByPageChartProps> = ({ visitors, isLoading = false }) => {
  // 페이지 경로 단순화
  const simplifyPagePath = (path: string) => {
    // URL이 너무 길면 축약
    if (path.length > 30) {
      return path.substring(0, 27) + '...';
    }
    return path;
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '페이지별 방문자 수',
      },
      tooltip: {
        callbacks: {
          title: (items: any) => {
            // 툴크에서는 전체 경로 표시
            const index = items[0].dataIndex;
            return visitors[index].page;
          }
        }
      }
    },
  };

  const data = {
    labels: visitors.map(item => simplifyPagePath(item.page)),
    datasets: [
      {
        label: '방문자 수',
        data: visitors.map(item => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  if (isLoading) {
    return <div className="h-80 flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Bar options={options} data={data} />
    </div>
  );
};

export default VisitorsByPageChart; 