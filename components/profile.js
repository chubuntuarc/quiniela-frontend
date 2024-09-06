import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ProfileForm({ initialProfile, onSubmit }) {
  const [userProfile, setUserProfile] = useState(initialProfile);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    onSubmit(userProfile);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserProfile({ ...userProfile, [id]: value });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Editar Perfil</h3>
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        {['name', 'email', 'username'].map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>
              {field === 'name' ? 'Nombre' : 
               field === 'email' ? 'Correo Electrónico' : 
               'Nombre de Usuario'}
            </Label>
            <Input
              id={field}
              type={field === 'email' ? 'email' : 'text'}
              value={userProfile[field]}
              onChange={handleInputChange}
            />
          </div>
        ))}
        <Button type="submit">Actualizar Perfil</Button>
      </form>
    </div>
  );
}

export default ProfileForm;