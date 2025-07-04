import { supabase } from './supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

export const createPost = async (content: string, imageUrl: string | null = null) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  const { error } = await supabase.from('posts').insert([
    {
      user_id: user.id,
      content,
      image_url: imageUrl,
      created_at: now,
      updated_at: now,
    },
  ]);

  if (error) throw error;
};

export const getPosts = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        username
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as Post[];
};

export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
};

export const updatePost = async (postId: string, content: string) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', postId)
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        username
      )
    `)
    .single();

  if (error) throw error;
  return data;
};