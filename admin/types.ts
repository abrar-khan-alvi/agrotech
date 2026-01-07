export type UserRole = 'SUPER_ADMIN' | 'CENTRAL_ADMIN' | 'REGIONAL_ADMIN' | 'SUB_ADMIN' | 'EXPERT' | 'FARMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  region?: string;
}

export interface Farmer {
  id: string;
  name: string;
  location: string;
  nid: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'DISABLED';
  farmSize: number; // in acres
  cropType: string;
  registrationDate: string;
}

export interface Expert {
  id: string;
  name: string;
  specialization: string;
  certificationId: string;
  isVerified: boolean;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  rating: number;
  region: string;
  earnings: number;
}

export interface SubAdmin {
  id: string;
  name: string;
  region: string;
  assignedDevices: number;
  accuracyScore: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Field {
  id: string;
  ownerName: string;
  location: string;
  area: number;
  crop: string;
  status: 'ACTIVE' | 'RESTING';
  sensorId?: string;
  lastSatelliteScan?: string;
  // Map specific properties
  coordinates?: string; // SVG path data or coordinate string
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  soilHealth?: number; // 0-100
}

export interface Consultation {
  id: string;
  farmerName: string;
  expertName?: string;
  topic: string;
  status: 'NEW' | 'ACTIVE' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  duration?: string;
  reportStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED';
}

export interface AdvisoryRequest {
  id: string;
  farmerName: string;
  topic: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  description: string;
}

export interface Report {
  id: string;
  consultationId: string;
  expertName: string;
  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REVISION_REQUESTED';
  qualityScore: number;
  flags: number;
}

export interface IoTDevice {
  id: string;
  type: 'SOIL_SENSOR' | 'WEATHER_STATION' | 'DRONE_BASE';
  location: string;
  assignedTo: string;
  samplingSessionId?: string; // Reference to the sampling session
  // Map specific properties
  coordinates?: { x: number; y: number }; // Percentage position 0-100
}

export interface CarbonRecord {
  id: string;
  activity: string;
  co2Saved: number; // in tons
  date: string;
  status: 'VERIFIED' | 'ESTIMATED' | 'SOLD';
  region: string;
  buyer?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  payer: string;
  type: 'SUBSCRIPTION' | 'SERVICE_FEE' | 'DATASET_SALE' | 'PAYOUT';
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
}