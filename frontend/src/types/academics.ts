export interface Career {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  description: string;
  duration_months: number;
  active: boolean;
}

export interface CareerPayload {
  code: string;
  name: string;
  description: string;
  duration_months: number;
  active: boolean;
}

export interface StudyPlan {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  version: string;
  effective_date: string;
  active: boolean;
  career: number;
}

export interface StudyPlanPayload {
  code: string;
  name: string;
  version: string;
  effective_date: string;
  active: boolean;
  career: number;
}

export interface Subject {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  weekly_hours: number;
  active: boolean;
}

export interface SubjectPayload {
  code: string;
  name: string;
  description: string;
  credits: number;
  weekly_hours: number;
  active: boolean;
}

export interface AcademicPeriod {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  enrollment_start: string;
  enrollment_end: string;
  status: string;
}

export interface AcademicPeriodPayload {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  enrollment_start: string;
  enrollment_end: string;
  status: string;
}

export interface StudyPlanSubject {
  id: number;
  created_at: string;
  updated_at: string;
  cycle_number: number;
  order: number;
  mandatory: boolean;
  passing_grade: string;
  study_plan: number;
  subject: number;
}

export interface StudyPlanSubjectPayload {
  cycle_number: number;
  order: number;
  mandatory: boolean;
  passing_grade: string;
  study_plan: number;
  subject: number;
}

export interface VirtualClassroom {
  id: number;
  code: string;
  name: string;
  subject: number;
  subject_name: string;
  academic_period: number;
  academic_period_name: string;
  study_plan: number | null;
  main_teacher: number | null;
  main_teacher_name: string;
  max_students: number;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface VirtualClassroomPayload {
  code: string;
  name: string;
  subject: number;
  academic_period: number;
  study_plan: number | null;
  main_teacher: number | null;
  max_students: number;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
}

export interface TeacherAssignment {
  id: number;
  teacher: number;
  teacher_name: string;
  virtual_classroom: number;
  classroom_name: string;
  role_in_class: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherAssignmentPayload {
  teacher: number;
  virtual_classroom: number;
  role_in_class: string;
}

export interface ClassroomEnrollment {
  id: number;
  student: number;
  student_name: string;
  student_code: string;
  virtual_classroom: number;
  classroom_name: string;
  enrolled_at: string;
  status: string;
  final_grade: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassroomEnrollmentPayload {
  student: number;
  virtual_classroom: number;
  status: string;
  final_grade: string | null;
}

export interface AcademicHistory {
  id: number;
  student: number;
  student_name: string;
  subject: number;
  subject_name: string;
  academic_period: number;
  academic_period_name: string;
  final_grade: string | null;
  status: string;
  observations: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicHistoryPayload {
  student: number;
  subject: number;
  academic_period: number;
  final_grade: string | null;
  status: string;
  observations: string;
}

export interface GradeRecord {
  id: number;
  student: number;
  student_name: string;
  virtual_classroom: number;
  classroom_name: string;
  assignment: number;
  assignment_title: string;
  submission: number | null;
  score: string;
  feedback: string;
  graded_by: number | null;
  graded_by_name: string;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradeRecordPayload {
  student: number;
  virtual_classroom: number;
  assignment: number;
  submission: number | null;
  score: string;
  feedback: string;
  graded_by: number | null;
  graded_at: string | null;
}

export interface WeeklyModule {
  id: number;
  virtual_classroom: number;
  classroom_name: string;
  week_number: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // NUEVO
  video_file?: string | null;      // ruta relativa en backend
  video_url?: string | null;       // url externa opcional
  video_file_url?: string | null;  // url absoluta construida por serializer  
}

export interface Assignment {
  id: number;
  weekly_module: number;
  weekly_module_title: string;
  title: string;
  instructions: string;
  due_date: string;
  max_score: string;
  allow_text_submission: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: number;
  file: string;
  file_url: string | null;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  text_submission: string;
  submitted_at: string;
  status: string;
  attempt_number: number;
  files: SubmissionFile[];
  precheck?: SubmissionPrecheck | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionPrecheck {
  has_title: boolean;
  has_conclusion: boolean;
  has_bibliography: boolean;
  paragraph_count: number;
  word_count: number;
  score: number;
  passed: boolean;
  feedback: string;
}