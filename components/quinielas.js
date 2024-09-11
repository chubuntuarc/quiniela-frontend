import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, PlusCircle, Users, AlertCircle, Trash2, CheckCircle2, Copy } from "lucide-react";
import { getSupabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Quinielas = ({
  isPremium,
  maxFriendsInFreeVersion,
  maxQuinielasInFreeVersion,
  session,
  userProfile,
  setShowSettings,
}) => {
  const [quinielas, setQuinielas] = useState([]);
  const [activeQuiniela, setActiveQuiniela] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newQuinielaName, setNewQuinielaName] = useState("");
  const [newQuinielaDescription, setNewQuinielaDescription] = useState("");
  const [error, setError] = useState(null);
  let supabase = null;
  const [editingQuiniela, setEditingQuiniela] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingQuinielaId, setDeletingQuinielaId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetchQuinielas();
  }, []);

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
        .eq("user_id", userProfile.id);

      if (userQuinielasError) throw userQuinielasError;

      const quinielaIds = userQuinielas.map((uq) => uq.quiniela_id);

      // Then, fetch the quinielas using these IDs
      const { data, error } = await supabase
        .from("quinielas")
        .select("*")
        .in("id", quinielaIds);

      if (error) throw error;

      // Fetch participants for each quiniela
      const participantsData = await Promise.all(data.map(async (quiniela) => {
        const { data: participants, error: participantsError } = await supabase
          .from("user_quinielas")
          .select("user_id")
          .eq("quiniela_id", quiniela.id);

        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
          return { ...quiniela, participants: 0 };
        }

        const uniqueParticipants = new Set(participants.map(p => p.user_id));

        return {
          ...quiniela,
          participants: uniqueParticipants.size
        };
      }));

      setQuinielas(participantsData);
      if (data.length > 0) {
        setActiveQuiniela(data[0]);
      }
    } catch (error) {
      console.error("Error fetching quinielas:", error);
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
      const endDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Generate a unique 8-character code
      let uniqueCode;
      let isUnique = false;
      while (!isUnique) {
        uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data, error } = await supabase
          .from("quinielas")
          .select("unique_code")
          .eq("unique_code", uniqueCode);

        if (error) throw error;
        if (data.length === 0) isUnique = true;
      }

      const { data, error } = await supabase
        .from("quinielas")
        .insert([
          {
            name: newQuinielaName,
            description: newQuinielaDescription,
            owner_id: userProfile.id,
            unique_code: uniqueCode,
            start_date: currentDate,
            end_date: endDate,
          },
        ])
        .select();

      if (error) throw error;

      // Add entry to user_quinielas
      const { error: userQuinielaError } = await supabase
        .from("user_quinielas")
        .insert([
          {
            user_id: userProfile.id,
            quiniela_id: data[0].id,
          },
        ]);

      if (userQuinielaError) throw userQuinielaError;

      setQuinielas([...quinielas, data[0]]);
      setActiveQuiniela(data[0]);
      setNewQuinielaName("");
      setNewQuinielaDescription("");
      setError(null); // Clear any previous errors
      setIsCreateModalOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error creating quiniela:", error);
      setError(
        error.message || "An error occurred while creating the quiniela"
      );
    }
  };

  const updateQuiniela = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      if (!session && !userProfile) throw new Error("User not authenticated");

      if (!editingQuiniela) {
        throw new Error("No se ha seleccionado ninguna quiniela para editar");
      }

      const { data, error } = await supabase
        .from("quinielas")
        .update({
          name: editingQuiniela.name,
          description: editingQuiniela.description,
        })
        .eq("id", editingQuiniela.id);

      if (error) throw error;

      // Fetch the updated quiniela
      const { data: updatedQuiniela, error: fetchError } = await supabase
        .from("quinielas")
        .select()
        .eq("id", editingQuiniela.id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state
      setQuinielas(
        quinielas.map((q) =>
          q.id === updatedQuiniela.id ? updatedQuiniela : q
        )
      );
      setActiveQuiniela(updatedQuiniela);
      setEditingQuiniela(null);
      setError(null);
    } catch (error) {
      console.error("Error updating quiniela:", error);
      setError(error.message || "Ocurrio un error al actualizar la quiniela");
    }
  };

  const deleteQuiniela = async (quinielaId) => {
    if (!supabase) {
      supabase = getSupabase();
    }
    try {
      if (!session && !userProfile) throw new Error("User not authenticated");

      // Delete from user_quinielas first
      const { error: userQuinielaError } = await supabase
        .from("user_quinielas")
        .delete()
        .eq("quiniela_id", quinielaId);

      if (userQuinielaError) throw userQuinielaError;

      // Then delete the quiniela itself
      const { error } = await supabase
        .from("quinielas")
        .delete()
        .eq("id", quinielaId);

      if (error) throw error;

      // Update local state
      setQuinielas(quinielas.filter((q) => q.id !== quinielaId));
      if (activeQuiniela && activeQuiniela.id === quinielaId) {
        setActiveQuiniela(quinielas[0] || null);
      }
      setError(null);
    } catch (error) {
      console.error("Error deleting quiniela:", error);
      setError(error.message || "Ocurrió un error al eliminar la quiniela");
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

  const handleDeleteClick = (quinielaId) => {
    setDeletingQuinielaId(quinielaId);
  };

  const handleConfirmDelete = async () => {
    if (deletingQuinielaId) {
      await deleteQuiniela(deletingQuinielaId);
      setDeletingQuinielaId(null);
    }
  };

  const inviteByWhatsApp = () => {
    const inviteUrl = `${window.location.origin}?invite=${activeQuiniela.unique_code}`;
    const message = encodeURIComponent(
      `¡Te invito a unirte a mi quiniela "${activeQuiniela.name}"! Haz clic en este enlace para participar: ${inviteUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleInviteByEmail = async () => {
    // Implement your email invitation logic here
    // This is a placeholder function
    console.log(`Inviting ${inviteEmail} to quiniela ${activeQuiniela.id}`);
    setSuccessMessage(`Se ha enviado una invitación a ${inviteEmail}`);
    setInviteEmail("");
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    setSuccessMessage(
      "El enlace de invitación ha sido copiado al portapapeles"
    );
  };

  const copyQuinielaCode = () => {
    navigator.clipboard.writeText(activeQuiniela.unique_code);
    setSuccessMessage(
      "El código de la quiniela ha sido copiado al portapapeles"
    );

    // Set a timeout to clear the success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleCreateQuiniela = () => {
    console.log("handleCreateQuiniela");
    setIsCreateModalOpen(true);
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

      {successMessage && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isPremium === "aqpb" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Límites de la versión básica</AlertTitle>
          <AlertDescription>
            Estás utilizando la versión básica, que permite crear{" "}
            {maxQuinielasInFreeVersion} quiniela de {maxFriendsInFreeVersion}{" "}
            amigos.
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-blue-500 hover:text-blue-600"
              onClick={() => setShowSettings(true)}
            >
              Suscríbete para obtener funciones ilimitadas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Mis Quinielas</h2>
        {isPremium === "aqpp" ||
        isPremium === "aqpr" ||
        quinielas.filter((q) => q.owner_id === userProfile.id).length === 0 ? (
          <Button
            disabled={
              (isPremium === "aqpb" || isPremium === "aqpl") &&
              quinielas.length >= maxQuinielasInFreeVersion
            }
            className="w-full sm:w-auto"
            onClick={handleCreateQuiniela}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Quiniela
          </Button>
        ) : null}
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
                  variant={
                    activeQuiniela.id === quiniela.id ? "default" : "outline"
                  }
                  className="h-auto py-4 justify-start w-full"
                  onClick={() => setActiveQuiniela(quiniela)}
                >
                  <div className="text-left">
                    <div className="flex items-center">
                      {quiniela.name} &nbsp;
                      {quiniela.owner_id === userProfile.id && (
                        <Users className="mr-2 h-4 w-4" />
                      )}
                    </div>
                    {quiniela.owner_id === userProfile.id && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {quiniela.unique_code}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyQuinielaCode}
                          title="Copiar código"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-4">
                      {quiniela.description || "No description available"}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {quiniela.participants}{" "}
                      {quiniela.participants === 1
                        ? "participante"
                        : "participantes"}
                    </div>
                  </div>
                </Button>
                {quiniela.owner_id === userProfile.id &&
                  activeQuiniela.id === quiniela.id && (
                    <div className="flex mt-2 gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditClick(quiniela)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteClick(quiniela.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  )}
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
                    value={editingQuiniela?.name || ""}
                    onChange={(e) =>
                      setEditingQuiniela({
                        ...editingQuiniela,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-description" className="text-right">
                    Descripción
                  </label>
                  <Textarea
                    id="edit-description"
                    className="col-span-3"
                    value={editingQuiniela?.description || ""}
                    onChange={(e) =>
                      setEditingQuiniela({
                        ...editingQuiniela,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveEdit}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!deletingQuinielaId}
            onOpenChange={() => setDeletingQuinielaId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar esta quiniela? <br />
                Esta acción no se puede deshacer.
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingQuinielaId(null)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activeQuiniela &&
            activeQuiniela.owner_id === userProfile.id &&
            (isPremium === "aqpp" ||
              isPremium === "aqpr" ||
              activeQuiniela.participants <= maxFriendsInFreeVersion) && (
              <div className="mt-8">
                <Dialog
                  open={isInviteModalOpen}
                  onOpenChange={setIsInviteModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Invitar Participantes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invitar Participantes</DialogTitle>
                      <DialogDescription>
                        Código: {activeQuiniela.unique_code}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invite-email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="invite-email"
                          className="col-span-3"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <Button onClick={handleInviteByEmail}>
                        Enviar Invitación
                      </Button> */}
                      <Button onClick={inviteByWhatsApp}>
                        Invitar por WhatsApp
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                  </div>
                ))}
              </div> */}
                {/* {!isPremium &&
                participants.length >=
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
                )} */}
              </div>
            )}
        </>
      )}

      {/* Create Quiniela Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Quiniela</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="new-name"
                className="col-span-3"
                value={newQuinielaName}
                onChange={(e) => setNewQuinielaName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="new-description"
                className="col-span-3"
                value={newQuinielaDescription}
                onChange={(e) => setNewQuinielaDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createQuiniela}>Crear Quiniela</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quinielas;
