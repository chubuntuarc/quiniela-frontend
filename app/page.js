"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Menu,
  PlusCircle,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Users,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const teams = [
  { name: "América", logo: "/placeholder.svg?height=32&width=32" },
  { name: "Guadalajara", logo: "/placeholder.svg?height=32&width=32" },
  { name: "Cruz Azul", logo: "/placeholder.svg?height=32&width=32" },
  { name: "Pumas UNAM", logo: "/placeholder.svg?height=32&width=32" },
  { name: "Tigres UANL", logo: "/placeholder.svg?height=32&width=32" },
  { name: "Monterrey", logo: "/placeholder.svg?height=32&width=32" },
];

const quinielas = [
  {
    id: 1,
    name: "Amigos del Fútbol",
    participants: ["Usuario1", "Usuario2", "Usuario3"],
  },
  {
    id: 2,
    name: "Colegas del Trabajo",
    participants: ["Usuario2", "Usuario4", "Usuario5"],
  },
  {
    id: 3,
    name: "Familia Futbolera",
    participants: ["Usuario1", "Usuario3", "Usuario6"],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("standings");
  const [activeQuiniela, setActiveQuiniela] = useState(quinielas[0]);
  const [isPremium, setIsPremium] = useState(false);

  const maxFriendsInFreeVersion = 5;
  const maxQuinielasInFreeVersion = 1;

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Menu className="h-6 w-6 md:hidden" />
          <h1 className="text-xl font-bold">Astro Quinielas</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline">Créditos: $1000</span>
          <Bell className="h-6 w-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="@usuario"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Registrar créditos</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ayuda</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="standings">Tabla de Posiciones</TabsTrigger>
            <TabsTrigger value="live">Juegos en Directo</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="quinielas">Quinielas</TabsTrigger>
          </TabsList>
          <TabsContent value="standings">
            <table className="w-full mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Pos</th>
                  <th className="p-2 text-left">Equipo</th>
                  <th className="p-2 text-center">PJ</th>
                  <th className="p-2 text-center">PG</th>
                  <th className="p-2 text-center">PE</th>
                  <th className="p-2 text-center">PP</th>
                  <th className="p-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 flex items-center">
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      {team.name}
                    </td>
                    <td className="p-2 text-center">{10}</td>
                    <td className="p-2 text-center">{8 - index}</td>
                    <td className="p-2 text-center">{1}</td>
                    <td className="p-2 text-center">{1 + index}</td>
                    <td className="p-2 text-center">{25 - index * 3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="live">
            <div className="grid gap-4 mt-4">
              {[
                { home: teams[0], away: teams[1], score: "2 - 1", time: "65'" },
                { home: teams[2], away: teams[3], score: "0 - 0", time: "32'" },
              ].map((game, index) => (
                <div
                  key={index}
                  className="bg-muted p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <Image
                      src={game.home.logo}
                      alt={game.home.name}
                      width={32}
                      height={32}
                      className="mr-2"
                    />
                    <span>{game.home.name}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{game.score}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.time}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span>{game.away.name}</span>
                    <Image
                      src={game.away.logo}
                      alt={game.away.name}
                      width={32}
                      height={32}
                      className="ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="participants">
            <table className="w-full mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Usuario</th>
                  <th className="p-2 text-center">Apuestas</th>
                  <th className="p-2 text-center">Ganadas</th>
                  <th className="p-2 text-center">Perdidas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { user: "Usuario1", bets: 15, won: 10, lost: 5 },
                  { user: "Usuario2", bets: 12, won: 8, lost: 4 },
                  { user: "Usuario3", bets: 10, won: 6, lost: 4 },
                ].map((participant, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{participant.user}</td>
                    <td className="p-2 text-center">{participant.bets}</td>
                    <td className="p-2 text-center">{participant.won}</td>
                    <td className="p-2 text-center">{participant.lost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="quinielas">
            <div className="mt-4 space-y-4">
              {!isPremium && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Límites de la versión gratuita</AlertTitle>
                  <AlertDescription>
                    Estás utilizando la versión gratuita, que permite hasta{" "}
                    {maxFriendsInFreeVersion} amigos y{" "}
                    {maxQuinielasInFreeVersion} quiniela.
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Quinielas</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={
                        !isPremium &&
                        quinielas.length >= maxQuinielasInFreeVersion
                      }
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
                        />
                      </div>
                    </div>
                    <Button>Crear Quiniela</Button>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quinielas.map((quiniela) => (
                  <Button
                    key={quiniela.id}
                    variant={
                      activeQuiniela.id === quiniela.id ? "default" : "outline"
                    }
                    className="h-auto py-4 justify-start"
                    onClick={() => setActiveQuiniela(quiniela)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div>{quiniela.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {quiniela.participants.length} participantes
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Participantes de {activeQuiniela.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeQuiniela.participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>{participant[0]}</AvatarFallback>
                      </Avatar>
                      <span>{participant}</span>
                    </div>
                  ))}
                </div>
                {!isPremium &&
                  activeQuiniela.participants.length >=
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
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating bet button and modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full" size="lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Apuesta
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Apuesta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Image
                src={teams[0].logo}
                alt={teams[0].name}
                width={32}
                height={32}
              />
              <span className="text-center font-bold">vs</span>
              <Image
                src={teams[1].logo}
                alt={teams[1].name}
                width={32}
                height={32}
                className="justify-self-end"
              />
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Resultado</th>
                  <th className="p-2 text-center">Cuota</th>
                  <th className="p-2 text-center">Apuesta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Victoria Local</td>
                  <td className="p-2 text-center">2.5</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      className="w-20 p-1 border rounded"
                      placeholder="$0"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Empate</td>
                  <td className="p-2 text-center">3.2</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      className="w-20 p-1 border rounded"
                      placeholder="$0"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Victoria Visitante</td>
                  <td className="p-2 text-center">2.8</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      className="w-20 p-1 border rounded"
                      placeholder="$0"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <Button>Confirmar Apuesta</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad banner */}
      <div className="bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Espacio para anuncios integrados
        </p>
      </div>
    </div>
  );
}
