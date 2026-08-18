export interface FinanceCharge {
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
  amount: string;
  due_date: string;
  status: string;
  total_paid: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface FinancePayment {
  id: number;
  student: number;
  student_name: string;
  student_code: string;
  charge: number;
  charge_reference: string;
  payment_date: string;
  amount: string;
  method: string;
  status: string;
  transaction_reference: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceConcept {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  default_amount: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}