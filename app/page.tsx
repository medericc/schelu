'use client';

import { useState } from 'react';
import Image from 'next/image';
import InputForm from './components/InputForm';
import MatchTable from './components/MatchTable';

interface MatchAction {
    period: string;
    gt: string; // Game time
    actionType: string;
    success: boolean;
    s1: string; // Score team 1
    s2: string; // Score team 2
    player: string; // Nom du joueur
}

interface MatchData {
    pbp: MatchAction[]; // Play-by-play data
}

export default function Home() {
    const [csvGenerated, setCsvGenerated] = useState(false);
    const [csvData, setCsvData] = useState<string[][]>([]);

    const handleGenerate = async (url: string, playerName: string) => {
        try {
            // Transformez l'URL
            const jsonUrl = url
                .replace(/\/u\/FFBB\//, '/data/') // Remplacez `/u/FFBB/` par `/data/`
                .replace(/\/bs\.html\/?/, '/') // Supprimez `/bs.html/` s'il existe
                .replace(/\/$/, '') + '/data.json'; // Supprimez le slash final et ajoutez `/data.json`

            console.log("URL JSON générée :", jsonUrl);

            // Fetch the JSON data via the proxy
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(jsonUrl)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                console.error("Erreur de récupération :", response.status, await response.text());
                alert('Données introuvables');
                return;
            }

            const data: MatchData = await response.json();
            console.log("Données récupérées :", data);

            const filteredData = data.pbp.filter((action) => action.player === "L. JEROME"); // Utiliser directement "L. JEROME"

            console.log("Actions filtrées pour L. JEROME :", filteredData); // Vérifiez si les données sont correctement filtrées
            
            // Ensuite, générez le CSV à partir des données filtrées
            const csvContent = generateCSV(filteredData);
            
            console.log("CSV généré :", csvContent);

            // Parsez les données CSV pour le tableau
            const rows = csvContent.split('\n').slice(1).map((row) => row.split(','));
            setCsvData(rows);

            // Mettez à jour l'état pour afficher le succès
            setCsvGenerated(true);
        } catch (error) {
            console.error("Erreur dans generateCsv:", error);
            alert('Une erreur est survenue lors de la génération du CSV.');
        }
    };

    const generateCSV = (data: MatchAction[]): string => {
        let csv = 'Période,Horodatage,Action,Réussite,Score\n';
        
        data.forEach((action) => {
            if (action.player === "L. JEROME") {  // Filtre les actions pour "L. JEROME"
                csv += `${action.period},${action.clock},${action.actionType},${action.success ? '1' : '0'},${action.s1}-${action.s2}\n`;
            }
        });
    
        return csv;
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12 gap-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <header className="flex flex-col items-center gap-4">
                <Image src="/next.svg" alt="Next.js logo" width={150} height={30} priority />
                <h1 className="text-xl font-semibold">Live Basketball Stats</h1>
            </header>

            <main className="flex flex-col items-center gap-6 w-full max-w-lg">
                <InputForm onGenerate={handleGenerate} />
                {csvGenerated && <MatchTable data={csvData} />}
            </main>

            <footer className="text-sm text-gray-500">
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Powered by Next.js
                </a>
            </footer>
        </div>
    );
}