import { getSupabase } from "./supabaseClient";

let supabaseInstance = null;

export async function loginUser(email, password) {
  try {
    if (supabaseInstance === null) {
      supabaseInstance = getSupabase();
    }

    const { data, error } = await supabaseInstance.auth.signInWithPassword({
      email,
      password,
    });

    if (!data.user) {
      return { success: false, error: "Estamos teniendo problemas, intenta más tarde" };
    }
    
    if (error) {
      return { success: false, error: error.message };
    }

    console.log(data);
    return { success: true, session: data.session, user: data.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Ocurrió un error inesperado, intenta más tarde" };
  }
}
