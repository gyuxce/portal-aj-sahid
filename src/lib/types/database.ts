// Hand-written types mirroring supabase/migrations/*.sql.
// Regenerate/replace with `supabase gen types typescript` once the project
// is linked to a real Supabase instance.

export type UserRole = "admin" | "student";
export type ActiveStatus = "active" | "archived";
export type AnnouncementStatus = "published" | "archived";
export type DayOfWeek = "friday" | "saturday";
export type TaskType = "individual" | "group";
export type GroupProgressStatus = "not_started" | "in_progress" | "done";
export type MaterialType =
  | "pdf"
  | "ppt"
  | "doc"
  | "xls"
  | "zip"
  | "link"
  | "other";
export type ImportSourceType = "csv" | "xlsx";
export type ImportEntityType =
  | "profiles"
  | "courses"
  | "groups"
  | "tasks"
  | "materials";
export type ImportStatus = "preview" | "confirmed" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          nim: string | null;
          full_name: string;
          nickname: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          lecturer: string | null;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]> & {
          code: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          course_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
          note: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["schedules"]["Row"]> & {
          course_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedules"]["Row"]>;
        Relationships: [];
      };
      course_links: {
        Row: {
          id: string;
          course_id: string;
          url: string;
          label: string | null;
          is_active: boolean;
          archived_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["course_links"]["Row"]> & {
          course_id: string;
          url: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["course_links"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          task_code: string;
          course_id: string;
          title: string;
          task_type: TaskType;
          description: string | null;
          deadline: string;
          status: ActiveStatus;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          task_code: string;
          course_id: string;
          title: string;
          task_type: TaskType;
          deadline: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          course_id: string;
          name: string;
          leader_id: string | null;
          notes: string | null;
          wa_group_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["groups"]["Row"]> & {
          course_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["groups"]["Row"]>;
        Relationships: [];
      };
      group_members: {
        Row: {
          group_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["group_members"]["Row"]
        > & {
          group_id: string;
          profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["group_members"]["Row"]>;
        Relationships: [];
      };
      group_task_updates: {
        Row: {
          id: string;
          group_id: string;
          task_id: string;
          progress_status: GroupProgressStatus;
          notes: string | null;
          updated_by: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["group_task_updates"]["Row"]
        > & {
          group_id: string;
          task_id: string;
          updated_by: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["group_task_updates"]["Row"]
        >;
        Relationships: [];
      };
      task_evidence: {
        Row: {
          id: string;
          task_id: string;
          group_id: string | null;
          external_url: string | null;
          storage_path: string | null;
          file_name: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["task_evidence"]["Row"]
        > & {
          task_id: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_evidence"]["Row"]>;
        Relationships: [];
      };
      materials: {
        Row: {
          id: string;
          course_id: string;
          task_id: string | null;
          title: string;
          material_type: MaterialType;
          meeting_number: number | null;
          external_url: string | null;
          storage_path: string | null;
          file_name: string | null;
          file_size: number | null;
          status: ActiveStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["materials"]["Row"]> & {
          course_id: string;
          title: string;
          material_type: MaterialType;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["materials"]["Row"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          course_id: string | null;
          title: string;
          body: string;
          is_pinned: boolean;
          status: AnnouncementStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["announcements"]["Row"]
        > & {
          title: string;
          body: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      import_batches: {
        Row: {
          id: string;
          source_file_name: string;
          source_type: ImportSourceType;
          entity_type: ImportEntityType;
          status: ImportStatus;
          total_rows: number;
          success_rows: number;
          error_rows: number;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["import_batches"]["Row"]
        > & {
          source_file_name: string;
          source_type: ImportSourceType;
          entity_type: ImportEntityType;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_batches"]["Row"]>;
        Relationships: [];
      };
      import_errors: {
        Row: {
          id: string;
          batch_id: string;
          row_number: number;
          field_name: string | null;
          message: string;
          raw_data: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["import_errors"]["Row"]> & {
          batch_id: string;
          row_number: number;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_errors"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type CourseLink = Database["public"]["Tables"]["course_links"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type Material = Database["public"]["Tables"]["materials"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
