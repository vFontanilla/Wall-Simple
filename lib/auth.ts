import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
}

// export const signUp = async (email: string, password: string, fullName: string) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: {
//         full_name: fullName,
//       },
//     },
//   });

//   if (error) throw error;
//   return data;
// };

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Optional: synced to auth.users
      },
    },
  });

  if (error) throw error;

  const user = data.user;
  const session = data.session;

  // ✅ Make sure we're authenticated
  if (!session || !user) {
    throw new Error('Sign-up failed: No session returned. Check if email confirmation is still enabled.');
  }

  const now = new Date().toISOString();

  // Insert a profile row linked to the authenticated user
  const { error: insertError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,               // 👈 MUST match auth.uid()
        full_name: fullName,
        created_at: now,
        updated_at: now,
      },
    ]);

  if (insertError) throw insertError;

  return data; // Returns user + session
};


export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: ProfileUpdate) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
