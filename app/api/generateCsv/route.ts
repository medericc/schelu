import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Force dynamic behavior

// Define interfaces for type safety
interface MatchAction {
    period: string;
    time: string;
    type: string;
    success: boolean;
    score: string;
}

interface MatchData {
    actions: MatchAction[];
}

export async function POST(req: Request) {
    try {
        // Parse the request body
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
        }

        // Transform the URL to fetch the JSON data
        const jsonUrl = url
            .replace(/\/u\/FFBB\//, '/data/') // Replace `/u/FFBB/` with `/data/`
            .replace(/\/bs\.html\/?/, '/') // Remove `/bs.html/` if it exists
            .replace(/\/$/, '') + '/data.json'; // Remove trailing slash and append `/data.json`

        console.log("URL JSON générée :", jsonUrl);

        // Fetch the JSON data
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            console.error("Erreur de récupération :", response.status, await response.text());
            return NextResponse.json({ error: 'Données introuvables' }, { status: 500 });
        }

        console.log("Statut de la réponse:", response.status);

        // Parse the JSON data
        const data: MatchData = await response.json();
        console.log("Données récupérées :", data);

        // Generate CSV content
        const csvContent = generateCSV(data);
        console.log("CSV généré :", csvContent);

        // Save the CSV file to the public directory
        const filePath = path.join(process.cwd(), 'public', 'match_data.csv');
        fs.writeFileSync(filePath, csvContent);

        // Return success response with the file path
        return NextResponse.json({ success: true, file: '/match_data.csv' });
    } catch (error: unknown) {
        console.error("Erreur dans generateCsv:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// Function to generate CSV content from MatchData
function generateCSV(data: MatchData): string {
    let csv = 'Période,Horodatage,Action,Success,Score\n';

    data.actions.forEach((action) => {
        console.log("Action à ajouter dans le CSV : ", action);  // Ajoute un log ici

        // Ajoute les données dans le format CSV
        csv += `${action.period},${action.time},${action.type},${action.success ? '1' : '0'},${action.score}\n`;
    });

    console.log("CSV final généré : ", csv);  // Log le CSV généré pour vérifier le résultat
    return csv;
}
