export type UserRole = "admin" | "coach_principal" | "coach" | "parent";
export type ProfileStatus = "actif" | "en_attente";
export type EventType = "match" | "training";
export type EventStatus = "draft" | "scheduled" | "completed" | "cancelled";
export type TourneeStatus = "draft" | "active" | "archived";
export type MatchResult = "win" | "loss";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          team_id: string | null;
          profile_status: ProfileStatus;
          parent_player_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          team_id?: string | null;
          profile_status?: ProfileStatus;
          parent_player_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tournees: {
        Row: {
          id: string;
          name: string;
          location: string;
          start_date: string;
          end_date: string;
          status: TourneeStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          start_date: string;
          end_date: string;
          status?: TourneeStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tournees"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          tournee_id: string;
          code: string;
          full_name: string;
          birth_year: number | null;
          ranking: string | null;
          parent_profile_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournee_id: string;
          code?: string;
          full_name: string;
          birth_year?: number | null;
          ranking?: string | null;
          parent_profile_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
        Relationships: [];
      };
      tournee_coaches: {
        Row: {
          id: string;
          tournee_id: string;
          coach_id: string;
          is_principal: boolean;
        };
        Insert: {
          id?: string;
          tournee_id: string;
          coach_id: string;
          is_principal?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["tournee_coaches"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          tournee_id: string;
          type: EventType;
          day_date: string;
          start_time: string;
          end_time: string;
          title: string;
          details: string | null;
          coach_id: string | null;
          status: EventStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournee_id: string;
          type: EventType;
          day_date: string;
          start_time: string;
          end_time: string;
          title: string;
          details?: string | null;
          coach_id?: string | null;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      event_players: {
        Row: {
          event_id: string;
          player_id: string;
        };
        Insert: {
          event_id: string;
          player_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_players"]["Insert"]>;
        Relationships: [];
      };
      match_results: {
        Row: {
          id: string;
          event_id: string;
          player_id: string;
          opponent: string;
          score: string;
          result: MatchResult;
        };
        Insert: {
          id?: string;
          event_id: string;
          player_id: string;
          opponent: string;
          score: string;
          result: MatchResult;
        };
        Update: Partial<Database["public"]["Tables"]["match_results"]["Insert"]>;
        Relationships: [];
      };
      debriefs: {
        Row: {
          id: string;
          event_id: string;
          player_id: string;
          coach_id: string;
          mental: number;
          service: number;
          return_game: number;
          movement: number;
          tactics: number;
          emotion: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          player_id: string;
          coach_id: string;
          mental: number;
          service: number;
          return_game: number;
          movement: number;
          tactics: number;
          emotion: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["debriefs"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Tournee = Database["public"]["Tables"]["tournees"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
