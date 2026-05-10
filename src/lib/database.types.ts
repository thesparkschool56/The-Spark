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
      admissions: {
        Row: {
          id: string
          student_name: string
          grade: string | null
          dob: string | null
          gender: string | null
          father_name: string | null
          mother_name: string | null
          guardian_name: string | null
          guardian_contact: string | null
          secondary_contact: string | null
          residential_address: string | null
          previous_school: string | null
          previous_grade: string | null
          campus_id: number | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_name: string
          grade?: string | null
          dob?: string | null
          gender?: string | null
          father_name?: string | null
          mother_name?: string | null
          guardian_name?: string | null
          guardian_contact?: string | null
          secondary_contact?: string | null
          residential_address?: string | null
          previous_school?: string | null
          previous_grade?: string | null
          campus_id?: number | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          grade?: string | null
          dob?: string | null
          gender?: string | null
          father_name?: string | null
          mother_name?: string | null
          guardian_name?: string | null
          guardian_contact?: string | null
          secondary_contact?: string | null
          residential_address?: string | null
          previous_school?: string | null
          previous_grade?: string | null
          campus_id?: number | null
          status?: string | null
          created_at?: string
        }
      }
      campuses: {
        Row: {
          id: number
          name: string
          color_theme: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          color_theme?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          color_theme?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: number
          title: string
          date: string
          description: string | null
          category: string | null
          time: string | null
          location: string | null
          general_info: string | null
          image_url: string | null
          class_name: string | null
          section: string | null
          campus_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          date: string
          description?: string | null
          category?: string | null
          time?: string | null
          location?: string | null
          general_info?: string | null
          image_url?: string | null
          class_name?: string | null
          section?: string | null
          campus_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          date?: string
          description?: string | null
          category?: string | null
          time?: string | null
          location?: string | null
          general_info?: string | null
          image_url?: string | null
          class_name?: string | null
          section?: string | null
          campus_id?: number | null
          created_at?: string
        }
      }
      faculty: {
        Row: {
          id: number
          name: string
          role: string | null
          section: string | null
          subject: string | null
          image_url: string | null
          campus_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          role?: string | null
          section?: string | null
          subject?: string | null
          image_url?: string | null
          campus_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          role?: string | null
          section?: string | null
          subject?: string | null
          image_url?: string | null
          campus_id?: number | null
          created_at?: string
        }
      }
      founders: {
        Row: {
          id: number
          name: string
          role: string | null
          quote: string | null
          bio: string | null
          image_url: string | null
          order: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          role?: string | null
          quote?: string | null
          bio?: string | null
          image_url?: string | null
          order?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          role?: string | null
          quote?: string | null
          bio?: string | null
          image_url?: string | null
          order?: number | null
          created_at?: string
        }
      }
      job_applicants: {
        Row: {
          id: string
          job_id: number | null
          full_name: string
          email: string | null
          phone: string | null
          age: number | null
          degree: string | null
          education: string | null
          department: string | null
          resume_url: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id?: number | null
          full_name: string
          email?: string | null
          phone?: string | null
          age?: number | null
          degree?: string | null
          education?: string | null
          department?: string | null
          resume_url?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: number | null
          full_name?: string
          email?: string | null
          phone?: string | null
          age?: number | null
          degree?: string | null
          education?: string | null
          department?: string | null
          resume_url?: string | null
          status?: string | null
          created_at?: string
        }
      }
      job_positions: {
        Row: {
          id: number
          title: string
          description: string | null
          department: string | null
          campus_id: number | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          department?: string | null
          campus_id?: number | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          department?: string | null
          campus_id?: number | null
          status?: string | null
          created_at?: string
        }
      }
      fees: {
        Row: {
          id: number
          section: string
          class_name: string
          tuition_fee: number
          admission_fee: number
          campus_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          section: string
          class_name: string
          tuition_fee: number
          admission_fee: number
          campus_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          section?: string
          class_name?: string
          tuition_fee?: number
          admission_fee?: number
          campus_id?: number | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          sender_name: string
          email: string
          message_body: string
          subject: string | null
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          sender_name: string
          email: string
          message_body: string
          subject?: string | null
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          sender_name?: string
          email?: string
          message_body?: string
          subject?: string | null
          is_read?: boolean | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          reviewer_name: string
          review_text: string
          role: string | null
          campus_id: number | null
          is_published: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          reviewer_name: string
          review_text: string
          role?: string | null
          campus_id?: number | null
          is_published?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          reviewer_name?: string
          review_text?: string
          role?: string | null
          campus_id?: number | null
          is_published?: boolean | null
          created_at?: string
        }
      }
      scoreboard: {
        Row: {
          id: string
          campus_id: number | null
          section: string
          house_name: string
          points: number | null
          created_at: string
        }
        Insert: {
          id?: string
          campus_id?: number | null
          section: string
          house_name: string
          points?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          campus_id?: number | null
          section?: string
          house_name?: string
          points?: number | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
