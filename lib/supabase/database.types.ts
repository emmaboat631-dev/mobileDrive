/**
 * Hand-rolled Supabase database types matching `supabase/migrations/0001_init.sql`.
 *
 * In production, regenerate this file with:
 *   npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          region: 'US' | 'GH' | 'EU' | null;
          role: 'customer' | 'dealer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          region?: 'US' | 'GH' | 'EU' | null;
          role?: 'customer' | 'dealer' | 'admin';
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      vehicles: {
        Row: {
          id: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          currency: 'USD' | 'GHS' | 'EUR';
          body_type: string;
          fuel_type: string;
          transmission: string;
          drive_type: string;
          horsepower: number;
          acceleration: number;
          top_speed: number;
          range_km: number | null;
          description: string;
          features: string[];
          model_path: string | null;
          hero_color_id: string;
          available_colors: Json;
          available_wheels: Json;
          available_interiors: Json;
          available_packages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
      };
      saved_configurations: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          color_id: string;
          wheel_id: string;
          interior_id: string;
          package_ids: string[];
          label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_configurations']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_configurations']['Insert']>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered' | 'cancelled';
          subtotal: number;
          options_total: number;
          taxes: number;
          grand_total: number;
          currency: 'USD' | 'GHS' | 'EUR';
          delivery_method: 'door' | 'pickup';
          delivery_address: Json;
          payment_method: string;
          payment_provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered' | 'cancelled';
          subtotal: number;
          options_total?: number;
          taxes?: number;
          grand_total: number;
          currency: 'USD' | 'GHS' | 'EUR';
          delivery_method: 'door' | 'pickup';
          delivery_address: Json;
          payment_method: string;
          payment_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          vehicle_id: string;
          configuration: Json;
          unit_price: number;
          options_price: number;
          line_total: number;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
