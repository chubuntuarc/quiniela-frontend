import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Signup({ setShowSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Implement signup logic here using formData
    // You'll need to use an API route to handle the signup process
    // and interact with your Vercel database
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Astro Quinielas</h1>
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
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
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
