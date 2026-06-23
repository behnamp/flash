export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_emoji: string
          plan: 'free' | 'creator' | 'venue'
          brand_name: string | null
          brand_logo: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      events: {
        Row: {
          id: string
          host_id: string
          name: string
          event_type: string
          venue: string | null
          event_date: string | null
          join_code: string
          is_active: boolean
          guest_cap: number
          shot_limit: number
          allow_video: boolean
          allow_voice: boolean
          allow_captions: boolean
          mode_control: 'lock' | 'menu' | 'free' | 'random' | 'blind'
          selected_modes: string[]
          locked_mode: string
          scavenger_hunt: boolean
          scavenger_prompts: string[]
          guest_book: boolean
          live_slideshow: boolean
          ai_reel: boolean
          print_enabled: boolean
          primary_language: string
          auto_translate: boolean
          white_label: boolean
          brand_name: string | null
          brand_logo_url: string | null
          brand_color: string
          reveal_mode: 'instant' | 'end' | 'rolling' | 'morning' | 'milestone'
          reveal_at: string | null
          revealed: boolean
          stats_card_enabled: boolean
          created_at: string
          updated_at: string
          ended_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'join_code' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      guests: {
        Row: {
          id: string
          event_id: string
          nickname: string
          avatar_emoji: string
          language: string
          assigned_mode: string | null
          session_token: string
          device_type: string | null
          shots_taken: number
          joined_at: string
          last_seen_at: string
        }
        Insert: Omit<Database['public']['Tables']['guests']['Row'], 'id' | 'session_token' | 'joined_at' | 'last_seen_at'>
        Update: Partial<Database['public']['Tables']['guests']['Insert']>
      }
      shots: {
        Row: {
          id: string
          event_id: string
          guest_id: string
          media_type: 'photo' | 'video' | 'voice'
          storage_path: string
          storage_url: string | null
          thumbnail_url: string | null
          mode_id: string
          mode_name: string | null
          width: number | null
          height: number | null
          duration_secs: number | null
          file_size_kb: number | null
          caption: string | null
          caption_translations: Json
          prompt_completed: string | null
          processed: boolean
          processing_error: string | null
          revealed: boolean
          shot_number: number
          taken_at: string
          processed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['shots']['Row'], 'id' | 'shot_number' | 'taken_at'>
        Update: Partial<Database['public']['Tables']['shots']['Insert']>
      }
      reactions: {
        Row: {
          id: string
          shot_id: string
          guest_id: string
          emoji: 'heart' | 'laugh' | 'fire' | 'wow'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {
      event_summary: { Row: Record<string, unknown> }
      shot_gallery: { Row: Record<string, unknown> }
    }
    Functions: {
      reveal_event: { Args: { event_id_param: string }; Returns: void }
      can_take_shot: { Args: { guest_id_param: string; event_id_param: string }; Returns: boolean }
      get_event_by_code: { Args: { code: string }; Returns: Database['public']['Tables']['events']['Row'] }
    }
  }
}
