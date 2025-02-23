'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface MatchTableProps {
  data: string[][]; // CSV data passed as a prop
}
const actionMapping: Record<string, string> = {
  'foulon': 'Foul On',
  'rebound': 'Rebound',
  'assist': 'Assist',
  '2pt': 'Tir à 2',
  'turnover': 'Turnover',
  '3pt': 'Tir à 3',
  'steal': 'Steal',
  'block': 'Block',
  'foul': 'Foul',
  '1pt': 'Lancer-Franc',
};
export default function MatchTable({ data }: MatchTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 w-full">
      {[1, 2, 3, 4].map((period) => (
        <Card key={period}>
          <CardContent>
          <h3 className="text-lg font-bold text-center mt-3 mb-3">PÉRIODE {period}</h3>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chrono</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Réussite</TableHead> 
                  
                </TableRow>
              </TableHeader>
              <TableBody>
  {data
    .filter((row) => row[0] === `${period}`) // Filtrer par période
    .filter((row) => row[2] !== 'substitution') // Ne pas afficher les substitutions
    .map((row, index) => {
      const action = row[2].toLowerCase();
      const success = row[3] === '1';

      // Renommer l'action si elle est dans le mapping
      const displayAction = actionMapping[action] || row[2];

      // Définir ✔️ ou ❌ en fonction de l'action et de la réussite
      let status = success ? '✔️' : '❌';

      // Actions négatives quand "réussies"
      if (['turnover', 'foul'].includes(action)) {
        status = success ? '❌' : '✔️';
      }

      return (
        <TableRow key={index}>
          <TableCell>{row[1]}</TableCell> {/* Horodatage */}
          <TableCell>{displayAction}</TableCell> {/* Action renommée */}
          <TableCell>{status}</TableCell> {/* Succès/Négatif adapté */}
        
        </TableRow>
      );
    })}
</TableBody>

            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}