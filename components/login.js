import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from '@vercel/postgres';
import Link from 'next/link';
import Signup from "./signup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // const router = useRouter();

  // const verifyUser = async (email, password) => {
  //   const client = createClient();
  //   await client.connect();
  //   try {
  //     const { rows } = await client.query(
  //       'SELECT * FROM users WHERE email = $1 AND password = $2',
  //       [email, password]
  //     );
  //     return rows.length > 0;
  //   } finally {
  //     await client.end();
  //   }
  // };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    // const isValid = await verifyUser(email, password);
    // if (isValid) {
    //   if (typeof window !== "undefined") {
    //     localStorage.setItem('session', 'active');
    //     router.push('/dashboard');
    //   }
    // } else {
    //   alert('Invalid credentials');
    // }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      {!showSignup ? (
        <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Astro Quinielas</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Inicia sesión a tu cuenta
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                placeholder="usuario@astroquinielas.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit">
              Entra con tu correo
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600">No tienes una cuenta </span>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowSignup(true)}
              >
                Registrate aqui
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O inicia sesión con
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Button variant="outline">
              {/* <Icons.facebook className="mr-2 h-4 w-4" /> */}
              Facebook
            </Button>
            <Button variant="outline">
              {/* <Icons.google className="mr-2 h-4 w-4" /> */}
              Google
            </Button>
          </div>
        </form>
      ) : (
        <Signup setShowSignup={setShowSignup} />
      )}
    </div>
  );
}
