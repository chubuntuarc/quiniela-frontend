import { getSupabase } from "./supabaseClient";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
// import { sendEmail } from './emailService'; // Add this import

// Add this function at the beginning of the file
let supabaseInstance = null;

export async function validateSupabaseConnection() {
  try {
    if (supabaseInstance === null) {
      supabaseInstance = await getSupabase();
    }
    const { data, error } = await supabaseInstance.from('users').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        console.error('Supabase table not found. The users table might not exist.');
        return false;
      }
      console.error('Supabase connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating Supabase connection:', error);
    return false;
  }
}

export async function checkUserExists(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        throw new Error('Error validando el usuario.');
      }
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
}

async function createUsersTable() {
  try {
    // Check if the table exists
    const { error } = await supabase.from('users').select('*').limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, so let's create it
      const { error: createError } = await supabase.rpc('create_users_table');

      if (createError) {
        console.error('Error creating users table:', createError);
        throw new Error('Failed to create users table');
      }

      console.log('Users table created successfully');
    } else if (error) {
      console.error('Error checking users table:', error);
      throw new Error('Failed to check users table existence');
    }
  } catch (error) {
    console.error('Error in createUsersTable:', error);
    throw error;
  }
}

export async function signupUser(userData, supabase) {
  const { name, email, password, city, favoriteTeam, plan } = userData;

  try {
    // Check if user already exists
    const userExists = await checkUserExists(email);

    if (userExists) {
      throw new Error('El usuario ya existe.');
    }

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
        throw new Error('Error de autenticación al crear el usuario. Verifique sus credenciales de Supabase.');
      } else {
        throw new Error(`No se pudo crear el usuario: ${error.message}`);
      }
    }

    // Log in the user and set the session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (sessionError) {
      throw new Error(`Error al iniciar sesión: ${sessionError.message}`);
    }

    // Return the user profile and session
    const { password: _, ...userWithoutPassword } = userProfile;
    return { user: userWithoutPassword, session: sessionData.session };

  } catch (error) {
    console.error('Error en signupUser:', error);
    throw error;
  }
}
