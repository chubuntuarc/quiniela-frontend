import { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { fetchMatches } from "../lib/matches";

const ParticipantsTable = ({ user }) => {

  const [activeQuiniela, setActiveQuiniela] = useState(null);
  const [quinielas, setQuinielas] = useState([]);
  const [bets, setBets] = useState([]);
  const [matches, setMatches] = useState([]);
  let supabase = null;

  const fetchBetsData = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("quiniela_id", activeQuiniela);

    const betsWithParsedMatchValues = data
      ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .filter((bet, index, self) =>
        index === self.findIndex((b) => b.user_id === bet.user_id)
      )
      .map(bet => ({
        ...bet,
        match_values: JSON.parse(bet.match_values)
      }));

    setBets(betsWithParsedMatchValues);
  };

  const fetchQuinielas = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    
    const matches = await fetchMatches();
    setMatches(matches);

    const { data: userQuinielas, error: userQuinielasError } = await supabase
      .from("user_quinielas")
      .select("quiniela_id")
      .eq("user_id", user.id);

    if (userQuinielasError) throw userQuinielasError;

    const quinielaIds = userQuinielas.map((uq) => uq.quiniela_id);
    const { data, error } = await supabase
      .from("quinielas")
      .select("*")
      .in("id", quinielaIds);

    setQuinielas(data);
    setActiveQuiniela(data[0].id);
    fetchBetsData();
  };

  useEffect(() => {
    fetchQuinielas();
  }, [activeQuiniela]);

  return (
    <div className="container mx-auto py-2 px-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Participantes</h2>
        <select onChange={(e) => setActiveQuiniela(e.target.value)}>
          {quinielas.map((quiniela) => (
            <option key={quiniela.id} value={quiniela.id}>
              {quiniela.name}
            </option>
          ))}
        </select>
      </div>
      <table className="w-full mt-4 overflow-x-auto">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left" style={{ fontSize: "10px" }}>
              Nombre
            </th>
            {matches?.map((match, index) => (
              <th className="p-2 text-left text-center" key={index}>
                <img
                  src={match.teams.home.logo}
                  alt="Home Team Logo"
                  className="mx-auto"
                />{" "}
                <span
                  style={{
                    fontSize: "10px",
                    textAlign: "center",
                    fontWeight: "100",
                  }}
                >
                  vs
                </span>{" "}
                <img
                  src={match.teams.away.logo}
                  alt="Away Team Logo"
                  className="mx-auto"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bets?.map((bet, betIndex) => (
            <tr key={betIndex} className="border-b">
              <td
                className="p-2"
                style={{
                  fontSize: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "80px",
                }}
              >
                {bet.name}
              </td>
              {matches?.map((match, matchIdx) => (
                <td
                  className="p-1 text-center"
                  style={{ fontSize: "10px" }}
                  key={matchIdx}
                >
                  {bet.match_values[matchIdx].home}-
                  {bet.match_values[matchIdx].away}
                  <br />
                  {(() => {
                    const actualHomeScore =
                      matches[matchIdx].fixture.score?.fulltime.home;
                    const actualAwayScore =
                      matches[matchIdx].fixture.score?.fulltime.away;

                    if (
                      matches[matchIdx].fixture.status.short === "1H" ||
                      matches[matchIdx].fixture.status.short === "HT"
                    ) {
                      return <span className="text-gray-500"> ⚽ </span>; // Match not played yet
                    } else if (
                      matches[matchIdx].fixture.status.short === "NS"
                    ) {
                      return <span className="text-gray-500"> 🔜 </span>; // Match not played yet
                    } else if (
                      bet.match_values[matchIdx].home === actualHomeScore &&
                      bet.match_values[matchIdx].away === actualAwayScore
                    ) {
                      return <span className="text-green-500">🟨</span>; // Exact result
                    } else if (
                      (bet.match_values[matchIdx].home >
                        bet.match_values[matchIdx].away &&
                        actualHomeScore > actualAwayScore) ||
                      (bet.match_values[matchIdx].home <
                        bet.match_values[matchIdx].away &&
                        actualHomeScore < actualAwayScore) ||
                      (bet.match_values[matchIdx].home ===
                        bet.match_values[matchIdx].away &&
                        actualHomeScore === actualAwayScore)
                    ) {
                      return <span className="text-yellow-500">✅</span>; // Correct winner or tie
                    } else {
                      return <span className="text-red-500">❌</span>; // Wrong bet
                    }
                  })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-muted-foreground">
        <br />
        *Los resultados se actualizan cada hora.
      </div>
    </div>
  );
};

export default ParticipantsTable;
