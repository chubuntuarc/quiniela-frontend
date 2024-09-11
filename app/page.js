"use client";

import { useEffect, useState, Suspense } from "react";
import { getSupabase } from '@/lib/supabaseClient';
import Login from "../components/login";
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
  PlusCircle,
  Settings,
  HelpCircle,
  LogOut,
  Eclipse,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StandingsTable } from '../components/standings';
import { Matches } from '../components/matches';
import ProfileForm from '../components/profile';
import Quinielas from '../components/quinielas';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import AdSense component with SSR disabled
const AdSense = dynamic(() => import('react-adsense'), { ssr: false });

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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("standings");
  const [activeQuiniela, setActiveQuiniela] = useState(quinielas[0]);
  const [isPremium, setIsPremium] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("plan");
  const [userProfile, setUserProfile] = useState(null);
  let supabase = null;
  const maxFriendsInFreeVersion = 5;
  const maxQuinielasInFreeVersion = 1;
  const searchParams = useSearchParams();
  const [alertMessage, setAlertMessage] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false);

  const plans = [
    {
      name: "Básico",
      code: "aqpb",
      price: "Gratis",
      features: ["1 quiniela", "5 amigos", "Publicidad"],
    },
    {
      name: "Libre",
      code: "aqpl",
      price: "$29",
      features: ["Plan Básico", "Sin publicidad"],
    },
    {
      name: "Pro",
      code: "aqpp",
      price: "$199",
      features: ["Quinielas ilimitadas", "Amigos ilimitados", "Sin publicidad"],
    },
    {
      name: "Premium",
      code: "aqpr",
      price: "$399",
      features: [
        "Todo en Pro",
        "Estadísticas avanzadas",
        "Soporte prioritario",
      ],
    },
  ];
  
  useEffect(() => {
    // Check for active session here
    // This is a placeholder, replace with your actual session check
    const checkSession = async () => {
      if (!supabase) {
        supabase = getSupabase();
      }
      // Simulating an API call or local storage check
      const { data: session, error } = await supabase.auth.getSession();
      if (session.session) {
        setSession(session.session);
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (user) {
          setUserProfile(user);
        }
        
      }
      
      let userPlan = null;
      const { data, error: userPlanError } = await supabase
        .from("user_plan")
        .select("plan_code")
        .eq("user_id", session.session?.user.id)
        .single();

      if (data) {
        userPlan = data;
      } else if (userPlanError && userPlanError.code === 'PGRST116') {
        console.log("No user plan found, using default");
        userPlan = { plan_code: "aqpb" }; // Set a default plan
      } else if (userPlanError) {
        console.error("Error fetching user plan:", userPlanError);
      }

      if (userPlan) {
        setIsPremium(userPlan.plan_code);
      }

      checkInviteCode(session.session);
      checkPlanCode(session.session);
      setLoading(false);
    };
    
    const handleInviteCode = async (inviteCode, userId) => {
      if (!supabase) {
        supabase = getSupabase();
      }

      try {
        // Search for the quiniela with the given invite code
        const { data: quiniela, error: quiniela_error } = await supabase
          .from("quinielas")
          .select("id")
          .eq("unique_code", inviteCode)
          .single();

        if (quiniela_error) throw quiniela_error;

        if (quiniela) {
          // Add the user to the user_quinielas table
          const { error: insert_error } = await supabase
            .from("user_quinielas")
            .insert({ user_id: userId, quiniela_id: quiniela.id });

          if (insert_error) throw insert_error;

          // Set alert message for successful join
          setAlertMessage("Successfully joined quiniela");
        } else {
          // Set alert message for invalid invite code
          setAlertMessage("Invalid invite code");
        }
      } catch (error) {
        console.error("Error processing invite code:", error);
        // Set alert message for error
        setAlertMessage("Error joining quiniela. Please try again.");
      }
    };

    const checkInviteCode = async (session) => {
      for (const [key, value] of searchParams.entries()) {
        console.log(`${key}: ${value}`);
      }
      const inviteCode = searchParams.get('invite');
      if (inviteCode && session) {
        await handleInviteCode(inviteCode, session.user.id);
      }
    };
    
    const checkPlanCode = async (session) => {
      for (const [key, value] of searchParams.entries()) {
        console.log(`${key}: ${value}`);
      }
      const planCode = searchParams.get("sp");
      if (planCode && session) {
        if (planCode === "aqpl") {
          try {
            let result;
            if (isPremium) {
              // Update existing record
              result = await supabase
                .from("user_plan")
                .update({ plan_code: planCode })
                .eq("user_id", session.user.id);
            } else {
              // Insert new record
              result = await supabase
                .from("user_plan")
                .insert({ user_id: session.user.id, plan_code: planCode });
            }

            if (result.error) {
              throw result.error;
            }

            console.log("Plan updated successfully");
            window.location.href = "/";
          } catch (error) {
            console.error("Error updating user plan:", error);
          }
        }
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !userProfile) {
    return <Login setSession={setSession} setUser={setUserProfile} />;
  }

  const handleLogout = async () => {
    if (!supabase) {
      supabase = getSupabase();
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setSession(null);
      setUserProfile(null);
    }
  };

  const handleSubscription = async (planName) => {
    const planUrls = {
      Libre:
        "https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=2c93808491d6d45e0191de25a6d8033f",
      Pro: "https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=2c93808491d6d45e0191de4f781f0354",
      Premium:
        "https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=2c93808491d6d4130191de5009c0036d",
    };
    if (planName === "Básico") return; // No action for the current plan
    
    setLoadingPlan(planName);
    try {
      const url = planUrls[planName];
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setLoadingPlan(null);
    }
  };

  const planLabels = {
    aqpb: "Plan Básico",
    aqpl: "Plan Libre",
    aqpp: "Plan Pro",
    aqpr: "Plan Premium"
  };

  const AdSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
      {
        content: (
          <>
            <span>Suscríbete a premium para tener acceso completo,</span>
            <span>sin anuncios y con soporte priorizado 🎉</span>
          </>
        ),
        action: () => setShowSettings(true),
      },
      {
        content: (
          <>
            <span>20% de Descuento en tu web hosting con Hostinger,</span>
            <span>
              con el código <span className="font-bold">1JESUS469</span>.
            </span>
          </>
        ),
        action: () =>
          window.open("https://hostinger.com?REFERRALCODE=1JESUS469", "_blank"),
      },
      {
        content: (
          <>
            <span>Compra, vende y gasta dólares digitales,</span>
            <span>seguro y con la mejor comisión en México 💵</span>
          </>
        ),
        action: () =>
          window.open(
            "https://www.dolarapp.com/referrals/onboard?referralCode=jesusarciniega_G7O",
            "_blank"
          ),
      },
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 10000); // Change slide every 5 seconds

      return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);

    return (
      <div className="fixed bottom-0 left-0 w-full bg-muted">
        <div className="relative p-4 text-center text-xs sm:text-sm flex justify-center items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-0 top-1/2 transform -translate-y-1/2"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-blue-500 hover:text-blue-600 flex flex-col items-center mx-8"
            onClick={slides[currentSlide].action}
            size="sm"
            style={{ fontSize: '13px' }}
          >
            {slides[currentSlide].content}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-0 top-1/2 transform -translate-y-1/2"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-4">
            <Eclipse className="h-6 w-6" />
            <h1 className="text-xl font-bold font-poppins">Astro Quinielas</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* <span className="hidden md:inline">Créditos: $1000</span> */}
          <Bell className="h-6 w-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                {userProfile.user?.profilePicture ? (
                  <AvatarImage
                    src={userProfile.user.user_metadata.avatar_url}
                    alt={userProfile.user.name}
                  />
                ) : (
                  <AvatarFallback
                    style={{ color: "black", backgroundColor: "white" }}
                  >
                    {userProfile?.user?.user_metadata?.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                )}
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
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {isPremium && planLabels[isPremium] && (
        <span className="text-xs text-center bg-secondary text-secondary-foreground px-2 py-1">
          {planLabels[isPremium]}
        </span>
      )}

      {/* Alert message */}
      {alertMessage && (
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4"
          role="alert"
        >
          <p>{alertMessage}</p>
          <button
            className="float-right font-bold"
            onClick={() => setAlertMessage(null)}
          >
            &times;
          </button>
        </div>
      )}

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
                        <Button
                          className="w-full"
                          onClick={() => handleSubscription(plan.name)}
                          disabled={
                            plan.code === isPremium || loadingPlan === plan.name
                          }
                        >
                          {loadingPlan === plan.name ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {plan.code === isPremium
                            ? "Plan Actual"
                            : `Cambiar a ${plan.name}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="profile">
                <ProfileForm initialProfile={userProfile.user} />
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
            <TabsList className="w-full flex flex-wrap justify-start gap-2">
              <TabsTrigger
                value="standings"
                className="flex-grow basis-auto text-xs sm:text-sm"
              >
                Tabla
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="flex-grow basis-auto text-xs sm:text-sm"
              >
                Juegos
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="flex-grow basis-auto text-xs sm:text-sm"
              >
                Participantes
              </TabsTrigger>
              <TabsTrigger
                value="quinielas"
                className="flex-grow basis-auto text-xs sm:text-sm"
              >
                Quinielas
              </TabsTrigger>
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
              <Quinielas
                isPremium={isPremium}
                maxFriendsInFreeVersion={maxFriendsInFreeVersion}
                maxQuinielasInFreeVersion={maxQuinielasInFreeVersion}
                setIsPremium={setIsPremium}
                quinielas={quinielas}
                activeQuiniela={activeQuiniela}
                setActiveQuiniela={setActiveQuiniela}
                userProfile={userProfile.user}
                setShowSettings={setShowSettings}
              />
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
            <Button className="fixed bottom-20 right-4 rounded-full" size="lg">
              Jugar
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

      {isPremium === "aqpb" && <AdSlider />}
    </div>
  );
}
