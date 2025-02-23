'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function InputForm({ onGenerate }: { onGenerate: (url: string) => void }) {
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <Input
        type="text"
        placeholder="Entrez le lien du match"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={() => onGenerate(url)}>Générer CSV</Button>
    </div>
  );
}