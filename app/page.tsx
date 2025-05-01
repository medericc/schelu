'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Match = {
  id: string;
  date: Date;
  opponent: string;
  opponentLogo: string;
};

export default function PhoenixSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocalTimes, setShowLocalTimes] = useState<{ [key: string]: boolean }>({});

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
            opponent: opponentTeam.displayName,
            opponentLogo: opponentTeam.logos?.[0]?.href ?? '',
          };
        });

      setMatches(parsed);
      setLoading(false);
    };

    getMatches();
  }, []);

  if (loading) return <p className="p-4">Les matchs arrivent.....</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ul className="space-y-4">
        {matches.map((match) => {
          const isLocal = showLocalTimes[match.id];
          const timeZone = isLocal
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : 'Africa/Lagos';

          const dayLabel = new Date(match.date).toLocaleDateString('en-US', {

            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone,
          }).toUpperCase();

          const hourLabel = new Date(match.date).toLocaleTimeString('en-US', {

            hour: '2-digit',
            minute: '2-digit',
            timeZone,
          });

          const flagCode = isLocal
            ? Intl.DateTimeFormat().resolvedOptions().locale.split('-')[1]?.toLowerCase() || 'us'
            : 'ng';

          return (
            <li key={match.id}>
              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <CardHeader className="text-center pt-4 pb-4 border-b">
                  <p className="text-xl font-bold capitalize tracking-wide">{dayLabel}</p>
                </CardHeader>

                <CardContent className="flex flex-row items-center justify-center gap-12 pb-3 mt-4">
                  {/* Opponent logo + name */}
                  <div className="flex flex-col items-center">
                    <img
                      src={match.opponentLogo}
                      alt={match.opponent}
                      className="w-12 h-12 object-contain"
                    />
                    <p className="text-sm text-gray-900 mt-1">{match.opponent}</p>
                  </div>

                  {/* Time + flag box */}
                  <div className="flex flex-col items-center justify-between border rounded-lg px-2 py-2 w-17 h-17 shadow-sm">
                    <img
                      src={`https://flagcdn.com/w40/${flagCode}.png`}
                      alt={flagCode.toUpperCase()}
                      className="w-5 h-4 mb-2"
                    />

                    <div
                      className="flex items-center gap-1 text-gray-600 text-sm cursor-pointer"
                      onClick={() =>
                        setShowLocalTimes((prev) => ({
                          ...prev,
                          [match.id]: !prev[match.id],
                        }))
                      }
                      title="Cliquez pour afficher l'heure locale"
                    >
                      <Clock className="w-4 h-4" />
                      <span>{hourLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
