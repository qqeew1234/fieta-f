'use client';

import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent } from '@/src/components/ui/tabs';
import { EtfTableBody, type ETF } from '@/src/components/etf-table-body';
import { IMessage } from '@stomp/stompjs';

interface EtfRankingTableProps {
  filteredEtfs: ETF[];
  hasMore: boolean;
  onLoadMore: () => void;
  onPriceUpdate: (message: IMessage) => void;
}

export function EtfRankingTable({
  filteredEtfs,
  hasMore,
  onLoadMore,
  onPriceUpdate,
}: EtfRankingTableProps) {
  return (
    <div className="mb-8">
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold"></h2>
        </div>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순위</TableHead>
                    <TableHead>ETF명</TableHead>
                    <TableHead>종목코드</TableHead>
                    <TableHead>테마</TableHead>
                    <TableHead className="text-right">현재가</TableHead>
                    <TableHead className="text-right">등락률</TableHead>
                    <TableHead className="text-right">거래량</TableHead>
                    <TableHead className="text-right">수익률</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <EtfTableBody
                    etfs={filteredEtfs}
                    onPriceUpdate={onPriceUpdate}
                  />
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="flex justify-center py-4">
              {hasMore && (
                <Button variant="outline" onClick={onLoadMore}>
                  더 보기
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
