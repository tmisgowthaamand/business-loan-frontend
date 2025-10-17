import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vxtpjsymbcirszksrafg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dHBqc3ltYmNpcnN6a3NyYWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MzY0NjAsImV4cCI6MjA3NTMxMjQ2MH0.ZYI75xNjBEhjrZb6jyxzS13BSo2oFzidPz6KdAlRvpU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (auto-generated from Supabase)
export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: number
          name: string
          email: string
          role: 'ADMIN' | 'EMPLOYEE'
          passwordHash: string | null
          inviteToken: string | null
          tokenExpiry: string | null
          createdAt: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          role: 'ADMIN' | 'EMPLOYEE'
          passwordHash?: string | null
          inviteToken?: string | null
          tokenExpiry?: string | null
          createdAt?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          role?: 'ADMIN' | 'EMPLOYEE'
          passwordHash?: string | null
          inviteToken?: string | null
          tokenExpiry?: string | null
          createdAt?: string
        }
      }
      Enquiry: {
        Row: {
          id: number
          date: string
          name: string
          mobile: string
          gst: string | null
          businessType: string | null
          staffId: number | null
          comments: string | null
          interestStatus: string | null
          createdAt: string
        }
        Insert: {
          id?: number
          date?: string
          name: string
          mobile: string
          gst?: string | null
          businessType?: string | null
          staffId?: number | null
          comments?: string | null
          interestStatus?: string | null
          createdAt?: string
        }
        Update: {
          id?: number
          date?: string
          name?: string
          mobile?: string
          gst?: string | null
          businessType?: string | null
          staffId?: number | null
          comments?: string | null
          interestStatus?: string | null
          createdAt?: string
        }
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
  }
}
