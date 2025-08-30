export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          tier: string;
          listings_count: number;
          created_at: string;
          updated_at: string;
          email: string | null;    // Must exist in DB
          phone: string | null;    // Must exist in DB
          website: string | null;  // Must exist in DB
        };
        Insert: {
          id: string;
          username?: string | null;
          tier?: string;
          listings_count?: number;
          created_at?: string;
          updated_at?: string;
          email?: string | null;   // Added
          phone?: string | null;   // Added
          website?: string | null; // Added
        };
        Update: {
          id?: string;
          username?: string | null;
          tier?: string;
          listings_count?: number;
          created_at?: string;
          updated_at?: string;
          email?: string | null;   // Added
          phone?: string | null;   // Added
          website?: string | null; // Added
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          condition: number;
          price: number;
          location: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          condition: number;
          price: number;
          location?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          condition?: number;
          price?: number;
          location?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          image_url: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          image_url: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          image_url?: string;
          position?: number;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string | null;
          seller_id: string | null;
          listing_id: string | null;
          status: string;
          total_amount: number;
          commission_amount: number;
          seller_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id?: string | null;
          seller_id?: string | null;
          listing_id?: string | null;
          status?: string;
          total_amount: number;
          commission_amount: number;
          seller_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string | null;
          seller_id?: string | null;
          listing_id?: string | null;
          status?: string;
          total_amount?: number;
          commission_amount?: number;
          seller_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      panels: {
        Row: {
          id: string;
          type: string;
          wattage: number;
          efficiency: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          wattage: number;
          efficiency: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          wattage?: number;
          efficiency?: number;
          created_at?: string;
        };
      };
      inverters: {
        Row: {
          id: string;
          type: string;
          power_rating: number;
          mppts: number;
          efficiency: number;
          phase: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          power_rating: number;
          mppts: number;
          efficiency: number;
          phase: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          power_rating?: number;
          mppts?: number;
          efficiency?: number;
          phase?: string;
          created_at?: string;
        };
      };
      batteries: {
        Row: {
          id: string;
          type: string;
          capacity: number;
          voltage: number;
          cycle_life: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          capacity: number;
          voltage: number;
          cycle_life: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          capacity?: number;
          voltage?: number;
          cycle_life?: number;
          created_at?: string;
        };
      };
      mounting: {
        Row: {
          id: string;
          type: string;
          material: string;
          resistance: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          material: string;
          resistance: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          material?: string;
          resistance?: string;
          created_at?: string;
        };
      };
      cable: {
        Row: {
          id: string;
          voltage_rating: number;
          current_capacity: number;
          wire_gauge: string;
          insulation_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          voltage_rating: number;
          current_capacity: number;
          wire_gauge: string;
          insulation_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          voltage_rating?: number;
          current_capacity?: number;
          wire_gauge?: string;
          insulation_type?: string;
          created_at?: string;
        };
      };
      others: {
        Row: {
          id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}