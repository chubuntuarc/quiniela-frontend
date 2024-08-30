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
        console.log(data);
        console.log(CURRENT_SEASON_NAME);
        const aperturaTeams = data.standings.find((standing) =>
          standing[0].group.includes(CURRENT_SEASON_NAME)
        );
        console.log(aperturaTeams);
        setTeams(aperturaTeams || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Ocurrio un problema al cargar los datos. Estamos trabajando en ello.');
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="bg-muted">
          <th className="p-2 text-left">Pos</th>
          <th className="p-2 text-left">Equipo</th>
          <th className="p-2 text-center">PJ</th>
          <th className="p-2 text-center">PG</th>
          <th className="p-2 text-center">PE</th>
          <th className="p-2 text-center">PP</th>
          <th className="p-2 text-center">GF</th>
          <th className="p-2 text-center">GC</th>
          <th className="p-2 text-center">DG</th>
          <th className="p-2 text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team, index) => (
          <tr key={team.team.id} className="border-b">
            <td className={`p-2 ${
              index < 4 ? 'text-green-600 font-semibold' :
              index < 12 ? 'text-orange-500 font-semibold' : ''
            }`}>
              {team.rank}
            </td>
            <td className="p-2 flex items-center">
              {team.team.logo ? (
                <Image
                  src={team.team.logo}
                  alt={team.team.name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 mr-2" />
              )}
              {team.team.name}
            </td>
            <td className="p-2 text-center">{team.all.played}</td>
            <td className="p-2 text-center">{team.all.win}</td>
            <td className="p-2 text-center">{team.all.draw}</td>
            <td className="p-2 text-center">{team.all.lose}</td>
            <td className="p-2 text-center">{team.all.goals.for}</td>
            <td className="p-2 text-center">{team.all.goals.against}</td>
            <td className="p-2 text-center">{team.goalsDiff}</td>
            <td className="p-2 text-center">{team.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
