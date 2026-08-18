export interface StudentProfile {
  id: number;
  student_code: string;
  status: string;
  career?: {
    id: number;
    code: string;
    name: string;
  };
  study_plan?: {
    id: number;
    code: string;
    name: string;
  };
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface StudentClassroom {
  id: number;
  code: string;
  name: string;
  subject: number;
  subject_name: string;
  status?: string;
}

export interface StudentAssignment {
  id: number;
  weekly_module: number;
  weekly_module_title: string;
  classroom_name: string;
  title: string;
  due_date: string;
  is_published?: boolean;
}

export interface StudentGrade {
  id: number;
  assignment: number;
  assignment_title: string;
  virtual_classroom: number;
  classroom_name: string;
  final_score?: number | string;
  score?: number | string;
  feedback?: string;
}

export interface StudentCharge {
  id: number;
  student: number;
  student_name: string;
  student_code: string;
  concept: number;
  concept_name: string;
  academic_period: number;
  academic_period_name: string;
  reference: string;
  description: string;
  amount: string | number;
  total_paid: string | number;
  balance: string | number;
  due_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentPayment {
  id: number;
  amount: string | number;
  method: string;
  status: string;
  payment_date: string;
}

export interface StudentStatement {
  student_id: number;
  student_code: string;
  student_name: string;
  total_charges: number | string;
  total_payments: number | string;
  balance: number | string;
  charges?: StudentCharge[];
  payments?: StudentPayment[];
}