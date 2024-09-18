import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { fetchMatches } from '../lib/matches';
import { getSupabase } from '../lib/supabaseClient';
let supabase;

const QuinielaForm = ({ user, setShowSettings }) => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [quinielas, setQuinielas] = useState([]);
  const [activeQuiniela, setActiveQuiniela] = useState(null);
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matchValues, setMatchValues] = useState([]);

  const fetchQuinielas = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      setLoading(true);

      // First, get the quiniela IDs from user_quinielas
      const { data: userQuinielas, error: userQuinielasError } = await supabase
        .from("user_quinielas")
        .select("quiniela_id")
        .eq("user_id", user.id);

      if (userQuinielasError) throw userQuinielasError;

      const quinielaIds = userQuinielas.map((uq) => uq.quiniela_id);

      // Then, fetch the quinielas using these IDs
      const { data, error } = await supabase
        .from("quinielas")
        .select("*")
        .in("id", quinielaIds);

      if (error) throw error;
      
      if (data.length > 0) {
        setQuinielas(data);
        setActiveQuiniela(data[0]);
      }
    } catch (error) {
      console.error("Error fetching quinielas:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveBet = async (betData) => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      const { user } = betData;
      const { quinielaId, matchValues } = betData;
      const { error } = await supabase
        .from("bets")
        .insert([{ user_id: user.id, name: user.user_metadata.name, quiniela_id: quinielaId, match_values: JSON.stringify(matchValues) }]);

      if (error) throw error;
      console.log("Bet saved successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error saving bet:", error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchMatches();
        setMatches(data);
        setMatchValues(data.map((match) => ({ id: match.fixture.id, home: '', away: '' }))); // Initialize matchValues based on fetched matches
        await fetchQuinielas();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Ocurrio un problema al cargar los datos. Estamos trabajando en ello."
        );
      }
    }

    fetchData();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-20 right-4 rounded-full" size="lg">
          Jugar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Apuesta</DialogTitle>
          <DialogDescription>Registra el resultado de cada partido</DialogDescription>
          {quinielas.length > 1 && (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una quiniela" />
              </SelectTrigger>
              <SelectContent>
                {quinielas.map((quiniela) => (
                  <SelectItem key={quiniela.id} value={quiniela.id}>
                    {quiniela.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </DialogHeader>
        <div className="grid gap-4">
          {matches.map((match, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <Image
                  src={match.teams.home.logo}
                  alt={match.teams.home.name}
                  width={36}
                  height={36}
                />
              </div>
              <input
                type="number"
                min="0"
                placeholder="Local"
                className="w-24 p-1 border rounded"
                value={matchValues[index]?.home || ''}
                onChange={(e) => {
                  const newValues = [...matchValues];
                  newValues[index].home = e.target.value;
                  setMatchValues(newValues);
                }}
              />
              <span className="text-center font-bold">vs</span>
              <input
                type="number"
                min="0"
                placeholder="Visitante"
                className="w-24 p-1 border rounded"
                value={matchValues[index]?.away || ''}
                onChange={(e) => {
                  const newValues = [...matchValues];
                  newValues[index].away = e.target.value;
                  setMatchValues(newValues);
                }}
              />
              <div className="flex items-center">
                <Image
                  src={match.teams.away.logo}
                  alt={match.teams.away.name}
                  width={36}
                  height={36}
                />
              </div>
            </div>
          ))}
          <div type="button" onClick={() => {
            // Validate that all inputs are filled
            const allInputsFilled = matchValues.every(match => match.home !== '' && match.away !== '');
            if (!allInputsFilled) {
              alert("Por favor, completa todos los campos de apuesta.");
              return; // Exit if not all inputs are filled
            }
            if (window.confirm("¿Estás seguro de que deseas confirmar la apuesta?")) {
              saveBet({ user, quinielaId: activeQuiniela.id, matchValues });
            }
          }}>
            <Button className="w-full">Confirmar Apuesta</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuinielaForm;
