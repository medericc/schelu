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
    const [selectedPlayer, setSelectedPlayer] = useState<string>("L. JEROME"); // État pour le joueur sélectionné
    const [selectedLink, setSelectedLink] = useState<string>(''); // État pour le lien sélectionné
    const [customUrl, setCustomUrl] = useState(''); // État pour l'URL personnalisée

    const preSavedLinks = [
        { name: "Match 1", url: "https://fibalivestats.dcd.shared.geniussports.com/u/FFBB/2513395/bs.html" },
        { name: "Match 2", url: "https://example.com/match2" },
        { name: "Match 3", url: "https://example.com/match3" }
    ];
    const playerMapping: Record<string, string> = {
        "Lucile": "L. JEROME",
        "Carla": "C. LEITE"
    };
    
    const handleGenerate = async () => {
        const url = selectedLink || customUrl;
    
        if (!url) {
            alert("Veuillez entrer un lien ou sélectionner un match.");
            return;
        }
    
        try {
            const jsonUrl = url
                .replace(/\/u\/FFBB\//, '/data/')
                .replace(/\/bs\.html\/?/, '/')
                .replace(/\/$/, '') + '/data.json';
    
            console.log("URL JSON générée :", jsonUrl);
    
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(jsonUrl)}`;
            const response = await fetch(proxyUrl);
    
            if (!response.ok) {
                console.error("Erreur de récupération :", response.status, await response.text());
                alert('Données introuvables');
                return;
            }
    
            const data: MatchData = await response.json();
            console.log("Données récupérées :", data);
    
            // Filtrer par joueur et trier du plus récent au plus ancien
            const filteredData = data.pbp
                .filter((action) => action.player === selectedPlayer)
                .sort((a, b) => b.gt.localeCompare(a.gt));
    
            console.log("Actions triées pour", selectedPlayer, ":", filteredData);
    
            const csvContent = generateCSV(filteredData);
            console.log("CSV généré :", csvContent);
    
            const rows = csvContent.split('\n').slice(1).map((row) => row.split(','));
            setCsvData(rows);
            setCsvGenerated(true);
        } catch (error) {
            console.error("Erreur dans generateCsv:", error);
            alert('Une erreur est survenue lors de la génération du CSV.');
        }
    };
    

    const generateCSV = (data: MatchAction[]): string => {
        let csv = 'Période,Horodatage,Action,Réussite,Score\n';
        
        data.forEach((action) => {
            if (action.player === selectedPlayer) {  // Utilisez le joueur sélectionné
                csv += `${action.period},${action.gt},${action.actionType},${action.success ? '1' : '0'},${action.s1}-${action.s2}\n`;
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
                {/* Menu déroulant pour sélectionner un joueur */}
                <select 
    value={selectedPlayer} 
    onChange={(e) => setSelectedPlayer(playerMapping[e.target.value] || e.target.value)} 
    className="mb-4 p-2 border rounded"
>
    {Object.entries(playerMapping).map(([displayName, realName]) => (
        <option key={realName} value={realName}>
            {displayName}
        </option>
    ))}
</select>

                {/* Menu déroulant pour les liens préenregistrés */}
                <select 
                    value={selectedLink} 
                    onChange={(e) => setSelectedLink(e.target.value)} 
                    className="mb-4 p-2 border rounded"
                >
                    <option value="">Sélectionne le Match</option>
                    {preSavedLinks.map((link) => (
                        <option key={link.url} value={link.url}>
                            {link.name}
                        </option>
                    ))}
                </select>

                {/* Champ de saisie du lien personnalisé */}
                <InputForm 
                    value={customUrl} 
                    onChange={(e) => setCustomUrl(e.target.value)} 
                    onGenerate={handleGenerate} 
                />

                {/* Affichage du tableau si le CSV est généré */}
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
