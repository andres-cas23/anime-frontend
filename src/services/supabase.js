import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const subirImagen = async (uri, nombreArchivo) => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data, error } = await supabase.storage
    .from('imagenes')
    .upload(`personajes/${nombreArchivo}`, uint8Array, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('imagenes')
    .getPublicUrl(`personajes/${nombreArchivo}`);

  return urlData.publicUrl;
};