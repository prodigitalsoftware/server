import { supabase } from '../config/supabase';

export class SupabaseService {
  /**
   * Health check with Supabase Project
   */
  public static async ping(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1);
      if (error && error.code !== '42P01') {
        // 42P01 means table does not exist yet (pending SQL schema run)
        console.warn('[Supabase ping warning]:', error.message);
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase ping error]:', err.message);
      return false;
    }
  }

  /**
   * Fetch products from Supabase
   */
  public static async getProducts() {
    return await supabase.from('products').select('*, categories(*)');
  }

  /**
   * Upload image to Supabase Storage bucket
   */
  public static async uploadProductImage(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.warn('[Supabase upload warning]:', error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error('[Supabase upload error]:', err.message);
      return null;
    }
  }
}

