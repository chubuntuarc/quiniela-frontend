import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Signup from "./signup";
import { Eclipse, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/login"; // Import the loginUser function

export default function Login({ setSession, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error messages
    const success = await loginUser(email, password);
    if (success.success) {
      setSession(success.session);
      setUser(success.user);
      localStorage.setItem("session", success.session);
      localStorage.setItem("user", JSON.stringify(success.user));
      return;
    } else {
      setErrorMessage(success.error || "Revisa tu usuario y contraseña");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      {!showSignup ? (
        <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold font-poppins flex items-center gap-2">
              <Eclipse className="h-6 w-6" />
              Astro Quinielas
            </h1>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <Button className="w-full" type="submit">
              Entra con tu correo
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                No tienes una cuenta{" "}
              </span>
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
          {errorMessage && (
            <div className="text-red-500 text-sm text-center">
              {errorMessage}
            </div>
          )}
        </form>
      ) : (
        <Signup setShowSignup={setShowSignup} />
      )}
    </div>
  );
}
