import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, PlusCircle, Users, AlertCircle } from "lucide-react";
import { getSupabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Quinielas = ({ 
  isPremium, 
  maxFriendsInFreeVersion, 
  maxQuinielasInFreeVersion, 
  setIsPremium,
  session,
  userProfile
}) => {
  const [quinielas, setQuinielas] = useState([]);
  const [activeQuiniela, setActiveQuiniela] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newQuinielaName, setNewQuinielaName] = useState('');
  const [newQuinielaDescription, setNewQuinielaDescription] = useState('');
  const [error, setError] = useState(null);
  let supabase = null;
  const [editingQuiniela, setEditingQuiniela] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchQuinielas();
  }, []);

  const fetchQuinielas = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quinielas')
        .select('*');
      
      if (error) throw error;
      
      setQuinielas(data);
      if (data.length > 0) {
        setActiveQuiniela(data[0]);
      }
    } catch (error) {
      console.error('Error fetching quinielas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuiniela = async () => {
    try {
      if (!supabase) {
        supabase = getSupabase();
      }

      if (!session && !userProfile) throw new Error("User not authenticated");
      
      const currentDate = new Date().toISOString();
      // Set end_date to 7 days from now as a default
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('quinielas')
        .insert([
          {
            name: newQuinielaName,
            description: newQuinielaDescription,
            owner_id: userProfile.id,
            start_date: currentDate,
            end_date: endDate,
          }
        ])
        .select();

      if (error) throw error;

      setQuinielas([...quinielas, data[0]]);
      setActiveQuiniela(data[0]);
      setNewQuinielaName('');
      setNewQuinielaDescription('');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error creating quiniela:', error);
      setError(error.message || 'An error occurred while creating the quiniela');
    }
  };

  const updateQuiniela = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      if (!editingQuiniela) {
        throw new Error("No se ha seleccionado ninguna quiniela para editar");
      }

      const { data, error } = await supabase
        .from('quinielas')
        .update({
          name: editingQuiniela.name,
          description: editingQuiniela.description
        })
        .eq('id', editingQuiniela.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setQuinielas(quinielas.map(q => q.id === data[0].id ? data[0] : q));
        setActiveQuiniela(data[0]);
      } else {
        // If no data is returned, update the local state with the edited values
        const updatedQuiniela = { ...editingQuiniela };
        setQuinielas(quinielas.map(q => q.id === updatedQuiniela.id ? updatedQuiniela : q));
        setActiveQuiniela(updatedQuiniela);
      }
      setEditingQuiniela(null);
      setError(null);
    } catch (error) {
      console.error('Error updating quiniela:', error);
      setError(error.message || 'Ocurrio un error al actualizar la quiniela');
    }
  };

  const handleEditClick = (quiniela) => {
    setEditingQuiniela({ ...quiniela });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    await updateQuiniela();
    setIsEditModalOpen(false);
  };

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isPremium && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Límites de la versión gratuita</AlertTitle>
          <AlertDescription>
            Estás utilizando la versión gratuita, que permite hasta{" "}
            {maxFriendsInFreeVersion} amigos y {maxQuinielasInFreeVersion}{" "}
            quiniela.
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-primary"
              onClick={() => setIsPremium(true)}
            >
              Suscríbete para obtener funciones ilimitadas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Mis Quinielas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={
                !isPremium && quinielas.length >= maxQuinielasInFreeVersion
              }
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Quiniela
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Quiniela</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nombre
                </label>
                <input
                  id="name"
                  className="col-span-3 p-2 border rounded"
                  value={newQuinielaName}
                  onChange={(e) => setNewQuinielaName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Descripción
                </label>
                <textarea
                  id="description"
                  className="col-span-3 p-2 border rounded"
                  value={newQuinielaDescription}
                  onChange={(e) => setNewQuinielaDescription(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={createQuiniela}>Crear Quiniela</Button>
          </DialogContent>
        </Dialog>
      </div>

      {quinielas.length === 0 ? (
        <Alert>
          <AlertDescription>
            No tienes quinielas creadas. ¡Crea tu primera quiniela para
            comenzar!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quinielas.map((quiniela) => (
              <div key={quiniela.id} className="flex flex-col">
                <Button
                  variant={activeQuiniela.id === quiniela.id ? "default" : "outline"}
                  className="h-auto py-4 justify-start w-full"
                  onClick={() => setActiveQuiniela(quiniela)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div>{quiniela.name}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {quiniela.description || "No description available"}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {quiniela?.participants?.length || 0} participantes
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleEditClick(quiniela)}
                >
                  Editar
                </Button>
              </div>
            ))}
          </div>

          {/* Edit Quiniela Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Quiniela</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-name" className="text-right">
                    Nombre
                  </label>
                  <Input
                    id="edit-name"
                    className="col-span-3"
                    value={editingQuiniela?.name || ''}
                    onChange={(e) => setEditingQuiniela({ ...editingQuiniela, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-description" className="text-right">
                    Descripción
                  </label>
                  <Textarea
                    id="edit-description"
                    className="col-span-3"
                    value={editingQuiniela?.description || ''}
                    onChange={(e) => setEditingQuiniela({ ...editingQuiniela, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveEdit}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activeQuiniela && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Participantes de {activeQuiniela?.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeQuiniela?.participants?.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>{participant[0]}</AvatarFallback>
                    </Avatar>
                    <span>{participant}</span>
                  </div>
                ))}
              </div>
              {!isPremium &&
                activeQuiniela?.participants?.length >=
                  maxFriendsInFreeVersion && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Límite de participantes alcanzado</AlertTitle>
                    <AlertDescription>
                      Has alcanzado el límite de {maxFriendsInFreeVersion}{" "}
                      participantes en la versión gratuita.
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-primary"
                        onClick={() => setIsPremium(true)}
                      >
                        Suscríbete para agregar más amigos
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quinielas;
