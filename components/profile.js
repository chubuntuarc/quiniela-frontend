import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSupabase } from '@/lib/supabaseClient'; // Add this import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ProfileForm({ initialProfile, onSubmit }) {
  const [userProfile, setUserProfile] = useState({
    name: initialProfile?.user_metadata?.name || '',
    email: initialProfile?.email || '',
    username: initialProfile?.user_metadata?.id || '',
    phone: initialProfile.phone || '',
    created_at: initialProfile.user_metadata.created_at || '',
    profileImage: initialProfile.identities[0].identity_data.profile_picture || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  let supabaseInstance = null;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
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
    
    try {
      const { data, error } = await updateAuthProfile(updatedProfile);
      if (error) throw error;
      if (typeof onSubmit === 'function') {
        onSubmit(data);
      } else {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error actualizando el perfil:', error.message);
      setError(error.message || 'Ocurrió un error inesperado, intenta más tarde');
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const updateAuthProfile = async (profile) => {
    if (supabaseInstance === null) {
      supabaseInstance = getSupabase();
    }
    const updates = {
      data: {
        name: profile.name,
        avatar_url: profile.profileImage,
      },
    };

    if (profile.email) {
      updates.email = profile.email;
    }

    if (profile.password) {
      updates.password = profile.password;
    }

    if (profile.phone !== initialProfile.phone) {
      updates.phone = profile.phone;
    }

    const { data, error } = await supabaseInstance.auth.updateUser(updates);

    if (error) throw error;

    return data;
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
      {showAlert && (
        <Alert className="mb-4 bg-[#0f172a] text-[#FFFF]">
          <AlertTitle className="text-[#FFFF]">Éxito</AlertTitle>
          <AlertDescription className="text-[#FFFF]">
            Perfil actualizado correctamente
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        {/* <div className="space-y-4">
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
        </div> */}
        {["name", "email"].map((field) => (
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