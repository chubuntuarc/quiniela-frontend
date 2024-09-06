import { getSupabase } from "./supabaseClient";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
// import { sendEmail } from './emailService'; // Add this import

// Add this function at the beginning of the file
let supabase = null;

export async function signupUser(userData) {
  const { name, email, password, city, favoriteTeam, plan } = userData;
  if (!supabase) {
    supabase = getSupabase();
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user profile
    const userProfile = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      city,
      credits: 0,
      profile_picture: null,
      favorite_team: favoriteTeam,
      plan,
      created_at: new Date().toISOString()
    };

    // Save user profile to Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: userProfile
      }
    });

    if (error) {
      if (error.status === 401) {
        return { error: 'Error de autenticación al crear el usuario. Verifique sus credenciales de Supabase.' };
      } else {
        return { error: `No se pudo crear el usuario: ${error.message}` };
      }
    }

    // Log in the user and set the session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (sessionError) {
      return { error: `Error al iniciar sesión: ${sessionError.message}` };
    }

    // Return the user profile and session
    const { password: _, ...userWithoutPassword } = userProfile;
    return { user: userWithoutPassword, session: sessionData.session };

  } catch (error) {
    console.error('Error en signupUser:', error);
    return { error: error.message };
  }
}
