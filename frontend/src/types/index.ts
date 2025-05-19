export interface User {
  id?: number | string;       // User ID, can be number or string from different sources
  username: string;           // Username
  email: string;              // User email
  password?: string;          // Password (optional, mainly for creation/update)
  role_id: number;            // Role ID (e.g., 1 for normal user, 2 for admin)
  created_at?: string;       // ISO date string for creation time
  updated_at?: string;       // ISO date string for update time
  
  // Fields that were previously in a mock user list in UsersView.vue
  // Include them if your backend actually provides them for admin views
  // or if they are part of the user object fetched by api.admin.getUsers()
  diabetes_type?: string;    // Type of diabetes
  activity_level?: string;   // User's activity level
  
  // Add any other fields that your user objects might have
}

// You can add other shared types here as your application grows.
// For example:
// export interface HealthRecord { ... }
// export interface AdminDashboardStats { ... }

export interface RecentActivityItem {
  type: string; // e.g., 'user_registration', 'health_record_submission', 'feedback_submission'
  username: string | null; // Username, or null for system events
  timestamp: string; // ISO date string
  details: string; // Description of the activity
}

export interface SystemHealthStats {
  cpu_usage: number;    // Percentage
  memory_usage: number; // Percentage
  disk_usage: number;   // Percentage
}

export interface DiabetesPredictionStats {
  count: number;
  positive_count: number;
  negative_count: number;
  predictions_today: number;
}

export interface ModelPerformance {
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  auc: number | null;
  last_trained: string | null;
}

export interface AdminDashboardStats {
  total_users: number;
  admin_users: number;
  normal_users: number;
  total_health_records: number;
  records_today: number;
  diabetes_predictions: DiabetesPredictionStats;
  avg_bmi: number | null;
  avg_glucose: number | null;
  avg_age: number | null;
  recent_activities: RecentActivityItem[];
  model_performance: ModelPerformance; // Can be simple or detailed based on backend
  system_health: SystemHealthStats; // CPU, Memory, Disk usage
}

// For User Health Records Page (UsersView.vue)
export interface HealthRecord {
  id: number;
  user_id: number;
  age: number;
  bmi: number;
  insulin: number;
  skin_thickness: number;
  glucose: number;
  pregnancies?: number; // Optional, if tracked
  blood_pressure?: number; // Optional, if tracked
  diabetes_pedigree_function?: number; // Optional, if tracked
  created_at: string; // ISO date string
  prediction_id?: number | null;
  // Potentially include prediction details if joined by the backend
  prediction_result?: string | null; // e.g., "Positive", "Negative"
  prediction_probability?: number | null;
} 