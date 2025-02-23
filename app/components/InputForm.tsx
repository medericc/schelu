'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function InputForm({
  value,
  onChange,
  onGenerate,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* <Input
        type="text"
        placeholder="Entrez le lien du match (ou laissez vide)"
        value={value}
        onChange={onChange}
      /> */}
      <Button onClick={onGenerate}>VOIR STATS</Button>
    </div>
  );
}
