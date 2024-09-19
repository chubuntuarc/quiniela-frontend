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
        const matches = data.filter((match) => match.league.round === data[0].league.round);
        console.log(matches);
        setMatches(matches);
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
    <div className="grid gap-4 mt-4 mb-20">
      <h2 className="text-1xl font-bold">
        {matches[0]?.league.round.replace("-", "- Jornada")}
      </h2>
      <div className="text-xs text-muted-foreground">
        *Los resultados se actualizan cada hora.
      </div>
      {matches.map((match, index) => (
        <div
          key={index}
          className="bg-muted p-4 rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center w-1/3">
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-xs sm:text-sm truncate">
              {match.teams.home.name}
            </span>
          </div>
          <div className="text-center flex flex-col items-center w-1/3">
            {match.fixture.status.short != "NS" ? (
              <>
                <div className="font-bold text-base sm:text-lg">{`${
                  match?.goals?.home || 0
                } - ${match?.goals?.away || 0}`}</div>
                <div className="text-xs text-muted-foreground">
                  {match?.fixture?.status?.short === "FT"
                    ? "Final"
                    : `${match.fixture.status.elapsed || 0}'`}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-base sm:text-lg"> vs </div>
                <div className="text-xs text-muted-foreground">
                  {match.fixture.venue.name}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-end w-1/3">
            <span className="text-xs sm:text-sm truncate">
              {match.teams.away.name}
            </span>
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
