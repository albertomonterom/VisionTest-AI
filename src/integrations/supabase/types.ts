export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      vision_data: {
        Row: {
          id: string;
          created_at: string;

          // Vision test
          right_eye_score: number | null;
          right_eye_total: number | null;
          left_eye_score: number | null;
          left_eye_total: number | null;

          // Self-reported diagnosis
          diagnosed_myopia: string | null;

          // Real diagnosis (true label)
          real_diagnosis: string | null;

          // Questionnaire A
          myopia_progression: string | null;
          glasses_update: string | null;
          vision_changes: string | null;
          night_vision: string | null;
          distance_vision: string | null;

          // Questionnaire B
          distance_blur: string | null;
          eye_squinting: string | null;
          headaches: string | null;
          close_work: string | null;
          vision_fatigue: string | null;

          // Lifestyle
          age_group: string | null;
          screen_time: string | null;
          wear_glasses: boolean | null;
          family_myopia: string | null;
          attention_check: string | null;
          eye_strain: string | null;
          eye_rest: string | null;
          sleep_hours: string | null;
          outdoor_time: string | null;
          reading_distance: string | null;

          // Meta
          correct_answers: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;

          right_eye_score?: number | null;
          right_eye_total?: number | null;
          left_eye_score?: number | null;
          left_eye_total?: number | null;

          diagnosed_myopia?: string | null;
          real_diagnosis?: string | null;

          myopia_progression?: string | null;
          glasses_update?: string | null;
          vision_changes?: string | null;
          night_vision?: string | null;
          distance_vision?: string | null;

          distance_blur?: string | null;
          eye_squinting?: string | null;
          headaches?: string | null;
          close_work?: string | null;
          vision_fatigue?: string | null;

          age_group?: string | null;
          screen_time?: string | null;
          wear_glasses?: boolean | null;
          family_myopia?: string | null;
          attention_check?: string | null;
          eye_strain?: string | null;
          eye_rest?: string | null;
          sleep_hours?: string | null;
          outdoor_time?: string | null;
          reading_distance?: string | null;

          correct_answers?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;

          right_eye_score?: number | null;
          right_eye_total?: number | null;
          left_eye_score?: number | null;
          left_eye_total?: number | null;

          diagnosed_myopia?: string | null;
          real_diagnosis?: string | null;

          myopia_progression?: string | null;
          glasses_update?: string | null;
          vision_changes?: string | null;
          night_vision?: string | null;
          distance_vision?: string | null;

          distance_blur?: string | null;
          eye_squinting?: string | null;
          headaches?: string | null;
          close_work?: string | null;
          vision_fatigue?: string | null;

          age_group?: string | null;
          screen_time?: string | null;
          wear_glasses?: boolean | null;
          family_myopia?: string | null;
          attention_check?: string | null;
          eye_strain?: string | null;
          eye_rest?: string | null;
          sleep_hours?: string | null;
          outdoor_time?: string | null;
          reading_distance?: string | null;

          correct_answers?: Json | null;
        };
        Relationships: [];
      };
  user_feedback: {
    Row: {
      id: string;
      created_at: string;
      vision_record_id: string;

      plan_doctor: "si" | "no" | "no_se";
      timeframe: string | null;
      priority: number;
      study_interest: "si" | "no" | "depende";
      multi_visit_willingness: number;
      main_factor: string | null;
    };
    Insert: {
      vision_record_id: string;

      plan_doctor: "si" | "no" | "no_se";
      timeframe?: string | null;
      priority: number;
      study_interest: "si" | "no" | "depende";
      multi_visit_willingness: number;
      main_factor?: string | null;
    };
    Update: {
      plan_doctor?: "si" | "no" | "no_se";
      timeframe?: string | null;
      priority?: number;
      study_interest?: "si" | "no" | "depende";
      multi_visit_willingness?: number;
      main_factor?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: "user_feedback_vision_record_id_fkey";
        columns: ["vision_record_id"];
        isOneToOne: false;
        referencedRelation: "vision_data";
        referencedColumns: ["id"];
      }
    ];
  };

    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
