export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          user_type: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          user_type?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          user_type?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          address: string
          latitude: number | null
          longitude: number | null
          category: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          address: string
          latitude?: number | null
          longitude?: number | null
          category: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          address?: string
          latitude?: number | null
          longitude?: number | null
          category?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string
          discount_value: string
          terms: string | null
          expiry_date: string
          is_active: boolean
          max_redemptions: number | null
          current_redemptions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description: string
          discount_value: string
          terms?: string | null
          expiry_date: string
          is_active?: boolean
          max_redemptions?: number | null
          current_redemptions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          description?: string
          discount_value?: string
          terms?: string | null
          expiry_date?: string
          is_active?: boolean
          max_redemptions?: number | null
          current_redemptions?: number
          created_at?: string
          updated_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          deal_id: string
          user_id: string
          business_id: string
          redemption_code: string
          status: string
          created_at: string
          redeemed_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          user_id: string
          business_id: string
          redemption_code: string
          status?: string
          created_at?: string
          redeemed_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          deal_id?: string
          user_id?: string
          business_id?: string
          redemption_code?: string
          status?: string
          created_at?: string
          redeemed_at?: string | null
          expires_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          deal_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deal_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string
          created_at?: string
        }
      }
    }
  }
}
