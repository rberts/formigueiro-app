export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          cnpj: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          name: string;
          description: string | null;
          status: string;
          start_date: string | null;
          due_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          name: string;
          description?: string | null;
          status: string;
          start_date?: string | null;
          due_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'to_start' | 'in_progress' | 'pending' | 'done';
          visibility: 'published' | 'archived' | 'trashed';
          due_date: string | null;
          start_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: 'to_start' | 'in_progress' | 'pending' | 'done';
          visibility?: 'published' | 'archived' | 'trashed';
          due_date?: string | null;
          start_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      task_activity_log: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          action_type: string;
          from_status: string | null;
          to_status: string | null;
          from_due_date: string | null;
          to_due_date: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          action_type: string;
          from_status?: string | null;
          to_status?: string | null;
          from_due_date?: string | null;
          to_due_date?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['task_activity_log']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
