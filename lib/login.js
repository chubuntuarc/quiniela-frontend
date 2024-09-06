import { getSupabase } from "./supabaseClient";

let supabaseInstance = null;

export async function loginUser(email, password) {
  try {
    if (supabaseInstance === null) {
      supabaseInstance = await getSupabase();
    }

    const { data, error } = await supabaseInstance.auth.signInWithPassword({
      email,
      password,
    });

    if (!data.user) {
      return { success: false, error: "User not found" };
    }
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
