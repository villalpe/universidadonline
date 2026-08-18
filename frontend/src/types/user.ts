export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role | null;
}