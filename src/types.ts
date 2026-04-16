export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'admin';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any; // Firestore Timestamp
}
