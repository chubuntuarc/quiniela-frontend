import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { fetchMatches } from '../lib/matches';
import { getSupabase } from '../lib/supabaseClient';
let supabase;

const QuinielaForm = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [quinielas, setQuinielas] = useState([]);
  const [activeQuiniela, setActiveQuiniela] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuinielas = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      setLoading(true);
      
      console.log(user);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchMatches();
        setMatches(data);
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
              />
              <span className="text-center font-bold">vs</span>
              <input
                type="number"
                min="0"
                placeholder="Visitante"
                className="w-24 p-1 border rounded"
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
          <Button type="submit">Confirmar Apuesta</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuinielaForm;
