'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface MatchTableProps {
  data: string[][]; // CSV data passed as a prop
}

export default function MatchTable({ data }: MatchTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 w-full">
      {[1, 2, 3, 4].map((period) => (
        <Card key={period}>
          <CardContent>
            <h3 className="text-lg font-bold mb-2">Période {period}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horodatage</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data
                  .filter((row) => row[0] === `${period}`) // Filter rows by period
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row[1]}</TableCell> {/* Time */}
                      <TableCell>{row[2]}</TableCell> {/* Action */}
                      <TableCell>{row[4]}</TableCell> {/* Score */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}