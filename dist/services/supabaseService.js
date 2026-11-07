"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_1 = require("../config/supabase");
class SupabaseService {
    /**
     * Health check with Supabase Project
     */
    static async ping() {
        try {
            const { data, error } = await supabase_1.supabase.from('settings').select('*').limit(1);
            if (error && error.code !== '42P01') {
                // 42P01 means table does not exist yet (pending SQL schema run)
                console.warn('[Supabase ping warning]:', error.message);
            }
            return true;
        }
        catch (err) {
            console.warn('[Supabase ping error]:', err.message);
            return false;
        }
    }
    /**
     * Fetch products from Supabase
     */
    static async getProducts() {
        return await supabase_1.supabase.from('products').select('*, categories(*)');
    }
    /**
     * Upload image to Supabase Storage bucket
     */
    static async uploadProductImage(fileName, fileBuffer, mimeType) {
        try {
            const { data, error } = await supabase_1.supabase.storage
                .from('product-images')
                .upload(fileName, fileBuffer, {
                contentType: mimeType,
                upsert: true,
            });
            if (error) {
                console.warn('[Supabase upload warning]:', error.message);
                return null;
            }
            const { data: publicUrlData } = supabase_1.supabase.storage.from('product-images').getPublicUrl(fileName);
            return publicUrlData.publicUrl;
        }
        catch (err) {
            console.error('[Supabase upload error]:', err.message);
            return null;
        }
    }
}
exports.SupabaseService = SupabaseService;
