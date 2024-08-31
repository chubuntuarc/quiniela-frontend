import Image from 'next/image';
import { fetchMatches } from '../lib/matches';
import { useState, useEffect } from 'react';

export function Matches() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchMatches();
        console.log(data);
        setMatches(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Ocurrio un problema al cargar los datos. Estamos trabajando en ello."
        );
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  return (
    <div className="grid gap-4 mt-4">
      {matches.map((match, index) => (
        <div
          key={index}
          className="bg-muted p-4 rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center">
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={32}
              height={32}
              className="mr-2"
            />
            <span>{match.teams.home.name}</span>
          </div>
          <div className="text-center">
            <div className="font-bold">{`${match.goals.home} - ${match.goals.away}`}</div>
            <div className="text-sm text-muted-foreground">
              {match.fixture.status.short === 'FT' ? 'Final' : `${match.fixture.status.elapsed}'`}
            </div>
          </div>
          <div className="flex items-center">
            <span>{match.teams.away.name}</span>
            <Image
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={32}
              height={32}
              className="ml-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
