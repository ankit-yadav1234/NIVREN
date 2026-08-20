import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-Memory Appointment Storage (Simulation of Secure Patient DB)
// Field names match the frontend's AppointmentInput contract exactly
// (frontend/src/types/appointment.ts) so requests never silently 400.
interface AppointmentRecord {
  id: string;
  name: string;
  email?: string;
  phone: string;
  departmentId: string;
  doctorId?: string;
  date: string;
  time: string;
  reason?: string;
  status: 'confirmed' | 'pending';
  createdAt: string;
  confirmationCode: string;
}

const appointmentsDatabase: AppointmentRecord[] = [];

// API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'NIVREN Healthcare API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const { name, email, phone, departmentId, doctorId, date, time, reason } = req.body;

  // Required fields match the frontend's zod schema exactly — email is
  // intentionally optional there (a phone confirmation call is enough).
  if (!name || !phone || !departmentId || !date || !time) {
    res.status(400).json({ error: 'Missing required fields: name, phone, departmentId, date, time' });
    return;
  }

  const confirmationCode = `NIV-${Math.floor(100000 + Math.random() * 900000)}`;

  const newAppointment: AppointmentRecord = {
    id: `apt-${Date.now()}`,
    name,
    email,
    phone,
    departmentId,
    doctorId,
    date,
    time,
    reason,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    confirmationCode
  };

  appointmentsDatabase.push(newAppointment);

  console.log(`🏥 New Appointment Booked: ${name} (${confirmationCode}) for ${date}`);

  // Shape matches the frontend's AppointmentResult contract exactly.
  res.status(201).json({
    success: true,
    referenceId: confirmationCode,
    message: 'Appointment request received.',
  });
});

app.get('/api/appointments', (req: Request, res: Response) => {
  res.json({
    totalCount: appointmentsDatabase.length,
    appointments: appointmentsDatabase
  });
});

// In-Memory Contact Message Storage
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

const contactMessages: ContactMessage[] = [];

app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Missing required fields: name, email, message' });
    return;
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone,
    message,
    createdAt: new Date().toISOString(),
  };

  contactMessages.push(newMessage);

  console.log(`📩 New Contact Message from ${name} (${email})`);

  res.status(201).json({
    success: true,
    message: 'Your message has been received.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NIVREN Healthcare Express Backend running on http://localhost:${PORT}`);
});
