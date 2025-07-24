'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, CalendarPlus } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { createEvents } from "ics";

type Match = {
  id: string;
  date: Date;
  opponent: string;
  opponentLogo: string;
  link: string; // 👈 Ajout ici
};
const translations = {
  fr: {
    addCalendarTitle: "Ajouter tous les matchs à votre calendrier ?",
    appleOutlook: "📅 Apple / Outlook (.ics)",
    googleCalendar: "📆 Google Calendar",
    cancel: "Annuler",
    googleInstructions: [
      "✅ Le fichier a été téléchargé !",
      "Voici comment l'importer dans Google Calendar :",
      "1. Ouvrez Google Calendar",
      "2. Cliquez sur la roue crantée en haut à droite → Paramètres",
      "3. Allez dans Importer et exporter",
      "4. Sélectionnez le fichier téléchargé : liberty_matchs.ics",
      "5. Importez-le dans le calendrier de votre choix",
      "🎉 Tous les matchs de MJ sont maintenant dans votre agenda !",
    ],
    iosInstructions: [
      "✅ Le fichier a été téléchargé !",
      "Si pas déjà importer :",
      "1. Ouvrez l'application Fichiers",
      "2. Rendez-vous dans le dossier Téléchargements",
      "3. Appuyez sur le fichier liberty_matchs.ics",
      "4. Choisissez Ajouter à Calendrier si proposé",
      "📅 Tous les matchs sont maintenant ajoutés à votre calendrier !",
    ],
    close: "Fermer",
  },
  en: {
    addCalendarTitle: "Add all matches to your calendar?",
    appleOutlook: "📅 Apple / Outlook (.ics)",
    googleCalendar: "📆 Google Calendar",
    cancel: "Cancel",
    googleInstructions: [
      "✅ The file has been downloaded!",
      "Here's how to import it into Google Calendar:",
      "1. Open Google Calendar",
      "2. Click the gear icon at the top right → Settings",
      "3. Go to Import and Export",
      "4. Select the downloaded file: liberty_matchs.ics",
      "5. Import it into the calendar of your choice",
      "🎉 All MJ matches are now in your agenda!",
    ],
    iosInstructions: [
      "✅ The file has been downloaded!",
      "If not already imported:",
      "1. Open the Files app",
      "2. Go to the Downloads folder",
      "3. Tap on the liberty_matchs.ics file",
      "4. Choose Add to Calendar if prompted",
      "📅 All matches are now added to your calendar!",
    ],
    close: "Close",
  },
};
function formatOpponentName(name: string): string {
  const mapping: { [key: string]: string } = {
    "Los Angeles Sparks": "L.A. Sparks",
    "Washington Mystics": "Washington",
    "New York Liberty": "NY Liberty",
    "Phoenix Mercury": "Phoenix",
    "Golden State Valkyries": "Golden State",
  };
  return mapping[name] || name;
}

export default function PhoenixSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"fr" | "en">("en");
  const [showLocalTimes, setShowLocalTimes] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGoogleInstructions, setShowGoogleInstructions] = useState(false);
 const [showiOSInstructions, setShowiOSInstructions] = useState(false); 
  

  useEffect(() => {
    const getMatches = async () => {
      const res = await fetch(
        `/api/proxy?url=${encodeURIComponent(
          'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams/phx/schedule'
        )}`
      );

      const data = await res.json();

      const now = new Date();
      const nowMinus5h = new Date(now.getTime() - 5 * 60 * 60 * 1000);

      const parsed = data.events
      .filter((event: any) => new Date(event.date) > nowMinus5h)
      .map((event: any) => {
        const date = new Date(event.date);
        const [home, away] = event.competitions[0].competitors;
        const isGSVHome = home.team.displayName === 'Phoenix Mercury';
        const opponentTeam = isGSVHome ? away.team : home.team;
    
        return {
          id: event.id,
          date,
          opponent: formatOpponentName(opponentTeam.displayName),
          opponentLogo: opponentTeam.logos?.[0]?.href ?? '',
          link: event.links?.[0]?.href ?? '#',
        };
      });

    setMatches(parsed);
    setLoading(false);
  };

    getMatches();
  }, []);

  const generateICS = () => {
    const events = matches.map((match) => ({
      start: [
        match.date.getFullYear(),
        match.date.getMonth() + 1,
        match.date.getDate(),
        match.date.getHours(),
        match.date.getMinutes(),
      ] as [number, number, number, number, number],
      duration: { hours: 2 },
      title: `Phoenix Mercury vs ${match.opponent}`,
      description: `Match contre ${match.opponent}`,
      location: 'Match WNBA',
      url: match.link,
    }));

    const { error, value } = createEvents(events as any);

    if (!error && value) {
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'phoenix_matchs.ics';
      a.click();
    }
  };
  const handleAppleOutlookImport = () => {
    generateICS(); // Télécharge le fichier .ics
    setShowiOSInstructions(true); // Affiche les instructions iOS
  };
  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-72px)] -mt-16">
  <div className="relative w-72 h-80 overflow-hidden">
         <img
  src="/loader.jpg"
  alt="Chargement des matchs"
  className="absolute top-0 left-0 w-full h-full object-contain object-center"
  style={{ 
    clipPath: 'inset(0 100% 0 0)', 
    transform: 'scale(1)', 
    opacity: 1, 
    animation: 'reveal-image 2.5s ease-out forwards' 
  }}
/>

        </div>
        <style jsx>{`
          @keyframes reveal-image {
            0% {
              clip-path: inset(0 100% 0 0); /* Masque total de l'image de gauche à droite */
              transform: scale(1); /* Pas de redimensionnement */
              opacity: 1; /* L'image est visible mais masquée */
            }
            100% {
              clip-path: inset(0 0 0 0); /* L'image est complètement révélée */
              transform: scale(1); /* L'image conserve sa taille normale */
              opacity: 1; /* L'image reste visible */
            }
          }
  
          .animate-reveal-image {
            animation: reveal-image 2.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
  const t = translations[language];
  const handleGoogleCalendarImport = () => {
    generateICS();
    setShowGoogleInstructions(true);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
  <ul className="space-y-4">
    {matches.map((match) => {
    const isLocal = showLocalTimes[match.id];

    const timeZone = isLocal
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Europe/Paris';
    
    const locale = isLocal
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : 'en-FR';
    
    const use12HourFormat = ['en-US', 'en-GB'].includes(locale);
    
    // Libellé jour
    const dayLabel = new Date(match.date).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone,
    }).toUpperCase();
    
    // Heure formatée selon locale
    const hourLabel = new Date(match.date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: use12HourFormat,
      timeZone,
    });
    
    // Drapeau
    const flagCode = isLocal
      ? locale.split('-')[1]?.toLowerCase() || 'us'
      : 'fr';
    
      return (
        <li key={match.id}>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl">
            <CardHeader className="text-center border-b p-4">
              <p className="text-xl font-semibold text-gray-800 tracking-wide">
                {dayLabel}
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between pl-6 pr-8 md:pl-16 md:pr-24 lg:pl-18 lg:pr-26 py-4">
              {/* Logo + Name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-white  flex items-center justify-center overflow-hidden">
                  <img
                    src={match.opponentLogo}
                    alt={match.opponent}
                    className="object-contain w-10 h-10"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 max-w-[140px] break-words leading-tight">
  {match.opponent}
</p>
   </div>

              {/* Time box */}
              <div className="flex flex-col items-center text-sm text-gray-700 mt-1">
                <img
                  src={`https://flagcdn.com/w40/${flagCode}.png`}
                  alt={flagCode.toUpperCase()}
                  className="w-5 h-4 mb-1"
                />
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() =>
                    setShowLocalTimes((prev) => ({
                      ...prev,
                      [match.id]: !prev[match.id],
                    }))
                  }
                  title="Cliquez pour afficher l'heure locale"
                >
                  <Clock className="w-3 h-3" />
                 <span className="text-sm">{hourLabel}</span>

                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-purple-800 p-2 rounded-b-xl flex justify-center">
  <a
    href={match.link} // Assure-toi que match.link contient une URL valide
    target="_blank"
    rel="noopener noreferrer"
    className="text-base font-semibold text-white tracking-wide hover:underline"
  >
    GAME AVAILABLE HERE
  </a>
</CardFooter>



          </Card>
        </li>
      );
    })}
  </ul>
    {/* Floating Button */}
    <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-700 hover:bg-purple-800 text-white rounded-full p-4 shadow-lg z-50"
        title="Ajouter au calendrier"
      >
        <CalendarPlus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel className="bg-white rounded-xl p-6 pt-12 pb-4 max-w-sm mx-auto shadow-xl relative">
      {/* Language Switcher */}
      <div className="absolute top-3 right-3 flex space-x-1">
        <button
          onClick={() => setLanguage("fr")}
          className={`px-2 py-1 rounded-full text-sm border ${
            language === "fr" ?  "bg-white border-gray-300" : "bg-gray-300 border-gray-500"
          }`}
          title="Passer en français"
        >
          🇫🇷
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-2 py-1 rounded-full text-sm border ${
            language === "en" ? "bg-white border-gray-300" : "bg-gray-300 border-gray-500"
          }`}
          title="Switch to English"
        >
          🇺🇸
        </button>
      </div>

      {/* Modal Title */}
      <DialogTitle className="text-xl font-bold mb-2 text-center">
        {t.addCalendarTitle}
      </DialogTitle>

      {!showGoogleInstructions && !showiOSInstructions ? (
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={handleAppleOutlookImport}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
          >
            {t.appleOutlook}
          </button>
          <button
            onClick={handleGoogleCalendarImport}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
          >
            {t.googleCalendar}
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-sm text-gray-500 mt-1"
          >
            {t.cancel}
          </button>
        </div>
      ) : showGoogleInstructions ? (
        <div className="space-y-3 text-center">
          {t.googleInstructions.map((instruction: string, index: number) => (
            <p key={index} className={index === 0 ? "text-green-600" : ""}>
              {instruction}
            </p>
          ))}
          <button
            onClick={() => {
              setIsModalOpen(false);
              setShowGoogleInstructions(false);
            }}
            className="mt-6 text-sm text-purple-700 font-semibold hover:underline"
          >
            {t.close}
          </button>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          {t.iosInstructions.map((instruction: string, index: number) => (
            <p key={index} className={index === 0 ? "text-green-600" : ""}>
              {instruction}
            </p>
          ))}
          <button
            onClick={() => {
              setIsModalOpen(false);
              setShowiOSInstructions(false);
            }}
            className="mt-6 text-sm text-purple-700 font-semibold hover:underline"
          >
            {t.close}
          </button>
        </div>
      )}
    </DialogPanel>
  </div>
</Dialog>
</div>

  );
}
