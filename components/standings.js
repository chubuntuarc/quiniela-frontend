import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchStandings } from '../lib/standings';

export function StandingsTable() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const CURRENT_SEASON_NAME = process.env.NEXT_PUBLIC_CURRENT_SEASON_NAME;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchStandings();
        const aperturaTeams = data.standings.find((standing) =>
          standing[0].group.includes(CURRENT_SEASON_NAME)
        );
        setTeams(aperturaTeams || []);
      } catch (error) {
        setError('Ocurrio un problema al cargar los datos. Estamos trabajando en ello.');
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-2 min-w-[320px]">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left text-xs sm:text-sm">Pos</th>
            <th className="p-2 text-left text-xs sm:text-sm">Equipo</th>
            <th className="p-2 text-center text-xs sm:text-sm">PJ</th>
            <th className="p-2 text-center text-xs sm:text-sm">PG</th>
            <th className="p-2 text-center text-xs sm:text-sm">PE</th>
            <th className="p-2 text-center text-xs sm:text-sm">PP</th>
            <th className="p-2 text-center text-xs sm:text-sm hidden sm:table-cell">GF</th>
            <th className="p-2 text-center text-xs sm:text-sm hidden sm:table-cell">GC</th>
            <th className="p-2 text-center text-xs sm:text-sm">DG</th>
            <th className="p-2 text-center text-xs sm:text-sm">Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.team.id} className="border-b">
              <td className={`p-1 pr-2 text-xs sm:text-sm ${
                index < 4 ? 'text-green-600 font-semibold' :
                index < 12 ? 'text-orange-500 font-semibold' : ''
              }`}>
                {team.rank}
              </td>
              <td className="p-1">
                <div className="flex items-center">
                  {team.team.logo ? (
                    <Image
                      src={team.team.logo}
                      alt={team.team.name}
                      width={16}
                      height={16}
                      className="mr-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 mr-2 flex-shrink-0" />
                  )}
                  <span className="truncate text-xs sm:text-sm">{team.team.name}</span>
                </div>
              </td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.all.played}</td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.all.win}</td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.all.draw}</td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.all.lose}</td>
              <td className="p-1 text-center text-xs sm:text-sm hidden sm:table-cell">{team.all.goals.for}</td>
              <td className="p-1 text-center text-xs sm:text-sm hidden sm:table-cell">{team.all.goals.against}</td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.goalsDiff}</td>
              <td className="p-1 text-center text-xs sm:text-sm">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
