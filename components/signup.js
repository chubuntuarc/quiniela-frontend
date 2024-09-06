import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eclipse, Eye, EyeOff } from "lucide-react";
import { signupUser, checkUserExists, validateSupabaseConnection } from "@/lib/signup";

export default function Signup({ setShowSignup, setSession, setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      // Check if Supabase connection is successful
      const isSupabaseConnected = await validateSupabaseConnection();
      if (!isSupabaseConnected) {
        alert("Error al conectar con Supabase. Por favor, intenta de nuevo más tarde.");
        return;
      }
      // Check if user already exists
      const userExists = await checkUserExists(formData.email);
      if (userExists) {
        alert("Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.");
        return;
      }
      
      // If user doesn't exist, proceed with signup
      const result = await signupUser(formData);
      console.log("Registro exitoso:", result);
      localStorage.setItem("session", result.session);
      localStorage.setItem("user", JSON.stringify(result.user));
      setSession(result.session);
      setUser(result.user);
      setShowSignup(false);
    } catch (error) {
      console.error("Error en el registro:", error);
      setError(error.message || "Hubo un error durante el registro. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold font-poppins flex items-center gap-2">
            <Eclipse className="h-6 w-6" />
            Astro Quinielas
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Hola, crea tu cuenta para comenzar a jugar
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              placeholder="Tu nombre"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@astroquinielas.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <Button className="w-full" type="submit">
            Crear cuenta
          </Button>
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowSignup(false)}
              className="text-sm text-blue-600 hover:underline"
              type="button"
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
