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
  Eclipse,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StandingsTable } from '../components/standings';
import { Matches } from '../components/matches';

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
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("plan");
  const [userProfile, setUserProfile] = useState({
    name: "Juan Pérez",
    email: "juan@example.com",
    username: "juanperez123"
  });

  const maxFriendsInFreeVersion = 5;
  const maxQuinielasInFreeVersion = 1;

  const plans = [
    { name: "Básico", price: "Gratis", features: ["1 quiniela", "5 amigos", "Publicidad"] },
    { name: "Pro", price: "Próximamente", features: ["Quinielas ilimitadas", "Amigos ilimitados", "Sin publicidad"] },
    { name: "Premium", price: "Próximamente", features: ["Todo en Pro", "Estadísticas avanzadas", "Soporte prioritario"] }
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el perfil en el backend
    alert("Perfil actualizado correctamente");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Eclipse className="h-6 w-6" />
          <h1 className="text-xl font-bold font-poppins">Astro Quinielas</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* <span className="hidden md:inline">Créditos: $1000</span> */}
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
              <DropdownMenuItem onSelect={() => setShowSettings(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Registrar créditos</span>
              </DropdownMenuItem> */}
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
        {showSettings ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Configuración</h2>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Volver
              </Button>
            </div>
            <Tabs
              value={activeSettingsTab}
              onValueChange={setActiveSettingsTab}
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="plan">Plan Actual</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                {/* <TabsTrigger value="credits">Créditos</TabsTrigger> */}
                <TabsTrigger value="support">Soporte</TabsTrigger>
              </TabsList>
              <TabsContent value="plan">
                <h3 className="text-xl font-semibold mb-4">
                  Planes Disponibles
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.name}>
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.price}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          {plan.name === "Básico"
                            ? "Plan Actual"
                            : `Cambiar a ${plan.name}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="profile">
                <h3 className="text-xl font-semibold mb-4">Editar Perfil</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      value={userProfile.username}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit">Actualizar Perfil</Button>
                </form>
              </TabsContent>
              {/* <TabsContent value="credits">
                <h3 className="text-xl font-semibold mb-4">
                  Gestión de Créditos
                </h3>
                <p className="mb-4">Saldo actual: $1000</p>
                <Button>Agregar Créditos</Button>
              </TabsContent> */}
              <TabsContent value="support">
                <h3 className="text-xl font-semibold mb-4">Soporte</h3>
                <p className="mb-4">
                  Si necesitas ayuda, no dudes en contactarnos:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Email: jesus@arciniega.dev</li>
                  {/* <li>Teléfono: +1 234 567 8900</li> */}
                  {/* <li>Chat en vivo: Disponible de 9am a 5pm</li> */}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="standings">Tabla de Posiciones</TabsTrigger>
              <TabsTrigger value="live">Juegos de la jornada</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="quinielas">Quinielas</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <Matches />
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
                        activeQuiniela.id === quiniela.id
                          ? "default"
                          : "outline"
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
                        <AlertTitle>
                          Límite de participantes alcanzado
                        </AlertTitle>
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
            <TabsContent value="standings">
              <StandingsTable teams={teams} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Floating bet button and modal */}
      {!showSettings && (
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
      )}

      {/* Ad banner */}
      <div className="bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Espacio para anuncios integrados
        </p>
      </div>
    </div>
  );
}
