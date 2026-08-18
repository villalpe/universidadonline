export interface AdminRole {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStudent {
  id: number;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    username?: string;
  };
  student_code?: string;
  career?: number;
  study_plan?: number;
  enrollment_date?: string;
  status?: string;
}

export interface AdminTeacher {
  id: number;
  user: AdminUser;
  employee_code: string;
  specialty: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface AdminVirtualClassroom {
  id: number;
  code: string;
  name: string;
  subject: number;
  subject_name: string;
  academic_period: number;
  academic_period_name: string;
  study_plan: number;
  main_teacher: number;
  main_teacher_name: string;
  max_students: number;
  start_date: string;
  end_date: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreatePayload {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: number;
}

export interface AdminCareer {
  id: number;
  code: string;
  name: string;
  description: string;
  duration_months: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStudyPlan {
  id: number;
  code: string;
  name: string;
  version: string;
  effective_date: string;
  active: boolean;
  career: number;
  created_at: string;
  updated_at: string;
}

export interface AdminStudentCreatePayload {
  user: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: number;
  };
  student_code: string;
  career: number;
  study_plan: number;
  enrollment_date: string;
  status: string;
  birth_date: string;
  address: string;
}

export interface AdminTeacherCreatePayload {
  user: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: number;
  };
  employee_code: string;
  specialty: string;
  hire_date: string;
}