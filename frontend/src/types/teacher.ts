export interface TeacherClassroom {
  id: number;
  code: string;
  name: string;
  subject: number;
  subject_name: string;
  status?: string;
}

export interface TeacherAssignment {
  id: number;
  weekly_module: number;
  weekly_module_title: string;
  classroom_name: string;
  title: string;
  due_date: string;
  is_published?: boolean;
}

export interface TeacherSubmissionFile {
  id: number;
  file: string;
  file_url: string;
  original_name: string;
  mime_type: string;
}

export interface TeacherSubmission {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  attempt_number: number;
  submitted_at: string;
  created_at?: string;
  status?: string;
  files?: TeacherSubmissionFile[];
}

export interface TeacherGradebookItem {
  id: number;
  student: number;
  student_name: string;
  virtual_classroom: number;
  classroom_name: string;
  assignment?: number;
  assignment_title?: string;
  final_score?: number | string;
  score?: number | string;
  feedback?: string;
}