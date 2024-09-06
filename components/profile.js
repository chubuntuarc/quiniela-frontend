import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ProfileForm({ initialProfile, onSubmit }) {
  const [userProfile, setUserProfile] = useState({
    name: initialProfile.user_metadata.name || '',
    email: initialProfile.email || '',
    username: initialProfile.user_metadata.id || '',
    phone: initialProfile.phone || '',
    created_at: initialProfile.user_metadata.created_at || '',
    profileImage: initialProfile.user_metadata.avatar_url || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const updatedProfile = { ...userProfile };
    
    // Only include email if it has changed
    if (updatedProfile.email === initialProfile.email) {
      delete updatedProfile.email;
    }
    
    // Only include password if it's filled
    if (!updatedProfile.password) {
      delete updatedProfile.password;
    } else {
      // Remove confirmPassword as it's not needed for the update
      delete updatedProfile.confirmPassword;
    }
    
    onSubmit(updatedProfile);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserProfile({ ...userProfile, [id]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setUserProfile({ ...userProfile, [id]: value });
    validatePasswords(id === 'password' ? value : userProfile.password, id === 'confirmPassword' ? value : userProfile.confirmPassword);
  };

  const validatePasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-2xl font-semibold mb-6">Editar Perfil</h3>
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="profileImage" className="text-lg">Imagen de Perfil</Label>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {userProfile.profileImage ? (
                <img
                  src={userProfile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-gray-600">
                  {getInitial(userProfile.name)}
                </span>
              )}
            </div>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        {["name", "email", "phone"].map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg">
              {field === "name"
                ? "Nombre"
                : field === "email"
                ? "Correo Electrónico"
                : field === "username"
                ? "Nombre de Usuario"
                : field === "phone"
                ? "Teléfono"
                : "Otro"}
            </Label>
            <Input
              id={field}
              type={
                field === "email"
                  ? "email"
                  : field === "phone"
                  ? "tel"
                  : field === "created_at"
                  ? "date"
                  : "text"
              }
              value={userProfile[field]}
              onChange={handleInputChange}
              readOnly={field === "created_at"}
              className="w-full"
            />
          </div>
        ))}
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-lg">Nueva Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={userProfile.password}
              onChange={handlePasswordChange}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-lg">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={userProfile.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full"
          />
        </div>
        
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}

        <Button type="submit" className="w-full sm:w-auto" disabled={!!passwordError}>Actualizar Perfil</Button>
      </form>
    </div>
  );
}

export default ProfileForm;