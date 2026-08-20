export interface AppointmentInput {
  name: string;
  phone: string;
  email?: string;
  departmentId: string;
  doctorId?: string;
  date: string;
  time: string;
  reason?: string;
}

export interface AppointmentResult {
  success: boolean;
  referenceId?: string;
  message?: string;
}
