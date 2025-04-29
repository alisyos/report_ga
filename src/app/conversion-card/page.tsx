'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, DownloadIcon, RefreshCw, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// 데이터 타입 정의
interface ConversionCardData {
  date: string;
  source: string;
  medium: string;
  deviceCategory: string;
  eventName: string;
  campaignName: string;
  manualTerm: string;
  eventCount: number;
  sessions: number;
  users: number;
}

interface ApiResponse {
  dimensions: string[];
  metrics: string[];
  rows: ConversionCardData[];
}

export default function ConversionCardPage() {
  // 상태 관리
  const [data, setData] = useState<ConversionCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7일 전
  const [endDate, setEndDate] = useState<Date>(new Date()); // 오늘
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [filterInquiries, setFilterInquiries] = useState<boolean>(false); // 문의하기 필터 상태

  // 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // 이벤트 필터 추가
      const eventFilterParam = filterInquiries ? '&eventFilter=문의하기' : '';
      
      const response = await fetch(
        `/api/analytics/conversion-card?startDate=${formattedStartDate}&endDate=${formattedEndDate}&limit=50${eventFilterParam}`
      );
      
      if (!response.ok) {
        throw new Error(`API 요청 오류: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      setData(result.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 가져오는 중 오류가 발생했습니다.');
      console.error('데이터 가져오기 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, [filterInquiries]); // 필터링 상태가 변경되면 데이터 다시 가져오기

  // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // CSV 다운로드 함수
  const downloadCSV = () => {
    if (data.length === 0) return;
    
    // CSV 헤더
    const headers = [
      '날짜', '소스', '매체', '기기 카테고리', '이벤트', '캠페인명', '세션 수동 검색어', '이벤트 수', '세션 수', '사용자 수'
    ];
    
    // CSV 데이터 행
    const csvRows = data.map(row => [
      formatDate(row.date),
      row.source,
      row.medium,
      row.deviceCategory,
      row.eventName,
      row.campaignName,
      row.manualTerm,
      row.eventCount.toString(),
      row.sessions.toString(),
      row.users.toString()
    ]);
    
    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // 다운로드 링크 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `전환카드_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">전환카드 리포트</h1>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <input
              type="checkbox"
              id="filter-inquiries"
              checked={filterInquiries}
              onChange={(e) => setFilterInquiries(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="filter-inquiries" className="flex items-center gap-1 text-sm">
              <Filter className="h-4 w-4" /> 문의하기만 보기
            </label>
          </div>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'PPP', { locale: ko })} ~ {format(endDate, 'PPP', { locale: ko })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => {
                  if (range?.from) setStartDate(range.from);
                  if (range?.to) setEndDate(range.to);
                }}
                locale={ko}
                disabled={{ after: new Date() }}
              />
              <div className="p-3 border-t border-border flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCalendarOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => {
                  setIsCalendarOpen(false);
                  fetchData();
                }}>
                  적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={fetchData} size="icon" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={downloadCSV} size="icon" variant="outline" disabled={data.length === 0}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전환카드 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">
              <p>{error}</p>
              <Button onClick={fetchData} variant="outline" className="mt-2">
                다시 시도
              </Button>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <p>데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>소스</TableHead>
                    <TableHead>매체</TableHead>
                    <TableHead>기기 카테고리</TableHead>
                    <TableHead>이벤트</TableHead>
                    <TableHead>캠페인명</TableHead>
                    <TableHead>세션 수동 검색어</TableHead>
                    <TableHead className="text-right">이벤트 수</TableHead>
                    <TableHead className="text-right">세션 수</TableHead>
                    <TableHead className="text-right">사용자 수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell>{row.medium}</TableCell>
                      <TableCell>{row.deviceCategory}</TableCell>
                      <TableCell>{row.eventName}</TableCell>
                      <TableCell>{row.campaignName}</TableCell>
                      <TableCell>{row.manualTerm}</TableCell>
                      <TableCell className="text-right">{row.eventCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.sessions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.users.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 