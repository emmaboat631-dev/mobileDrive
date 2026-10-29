/**
 * Supabase database types — auto-generated from the live project.
 *
 * To regenerate after a migration:
 *   npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > lib/supabase/database.types.ts
 *
 * Project ref: pwjxrbzmflpepjtxogjv
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          configuration: Json
          id: string
          line_total: number
          options_price: number
          order_id: string
          unit_price: number
          vehicle_id: string
        }
        Insert: {
          configuration: Json
          id?: string
          line_total: number
          options_price?: number
          order_id: string
          unit_price: number
          vehicle_id: string
        }
        Update: {
          configuration?: Json
          id?: string
          line_total?: number
          options_price?: number
          order_id?: string
          unit_price?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          delivery_address: Json
          delivery_method: string
          grand_total: number
          id: string
          options_total: number
          payment_method: string
          payment_provider_id: string | null
          status: string
          subtotal: number
          taxes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency: string
          delivery_address: Json
          delivery_method: string
          grand_total: number
          id?: string
          options_total?: number
          payment_method: string
          payment_provider_id?: string | null
          status?: string
          subtotal: number
          taxes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_address?: Json
          delivery_method?: string
          grand_total?: number
          id?: string
          options_total?: number
          payment_method?: string
          payment_provider_id?: string | null
          status?: string
          subtotal?: number
          taxes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          region: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          region?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_configurations: {
        Row: {
          color_id: string
          created_at: string
          id: string
          interior_id: string
          label: string | null
          package_ids: string[]
          updated_at: string
          user_id: string
          vehicle_id: string
          wheel_id: string
        }
        Insert: {
          color_id: string
          created_at?: string
          id?: string
          interior_id: string
          label?: string | null
          package_ids?: string[]
          updated_at?: string
          user_id: string
          vehicle_id: string
          wheel_id: string
        }
        Update: {
          color_id?: string
          created_at?: string
          id?: string
          interior_id?: string
          label?: string | null
          package_ids?: string[]
          updated_at?: string
          user_id?: string
          vehicle_id?: string
          wheel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_configurations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_configurations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_drive_bookings: {
        Row: {
          created_at: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_drive_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_drive_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          acceleration: number
          available_colors: Json
          available_interiors: Json
          available_packages: Json
          available_wheels: Json
          body_type: string
          brand: string
          created_at: string
          currency: string
          description: string
          drive_type: string
          features: string[]
          fuel_type: string
          hero_color_id: string
          horsepower: number
          id: string
          model: string
          model_path: string | null
          price: number
          range_km: number | null
          top_speed: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          acceleration: number
          available_colors?: Json
          available_interiors?: Json
          available_packages?: Json
          available_wheels?: Json
          body_type: string
          brand: string
          created_at?: string
          currency: string
          description: string
          drive_type: string
          features?: string[]
          fuel_type: string
          hero_color_id: string
          horsepower: number
          id: string
          model: string
          model_path?: string | null
          price: number
          range_km?: number | null
          top_speed: number
          transmission: string
          updated_at?: string
          year: number
        }
        Update: {
          acceleration?: number
          available_colors?: Json
          available_interiors?: Json
          available_packages?: Json
          available_wheels?: Json
          body_type?: string
          brand?: string
          created_at?: string
          currency?: string
          description?: string
          drive_type?: string
          features?: string[]
          fuel_type?: string
          hero_color_id?: string
          horsepower?: number
          id?: string
          model?: string
          model_path?: string | null
          price?: number
          range_km?: number | null
          top_speed?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
