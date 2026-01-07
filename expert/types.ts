export enum RequestStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Farmer {
  id: string;
  name: string;
  location: string;
  phone: string;
  avatar: string;
  experienceLevel: string;
  fields?: {
    id: number;
    name: string;
    crop_type: string;
    area: number;
    harvest_time: string;
  }[];
}

export interface IoTDataPoint {
  time: string;
  moisture: number; // %
  temp: number; // Celsius
  humidity: number; // %
}

export interface SoilData {
  lastSampleDate: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  phLevel: number;
  confidenceScore: number; // 0-100
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

export interface FieldHealthSnapshot {
  soilHealth: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  salinity: 'Low' | 'Medium' | 'High';
  floodRisk: 'Low' | 'Medium' | 'High';
  diseaseRisk: 'Low' | 'Medium' | 'High';
}

export interface DataConfidence {
  level: 'High' | 'Medium' | 'Low';
  lastIoTUpdate: string; // e.g., "2 hours ago" or "45 days ago"
  samplingPoints: number;
  warning?: string;
}

export interface ExpertRequest {
  id: string;
  farmer: Farmer;
  status: RequestStatus;
  urgency: Urgency;
  assignedDate: string;
  field?: {
    id?: number;
    name: string;
    area: string;
    crop: string;
    harvestTimeline: string;
    coordinates: [number, number];
  };
  issueType: string;
  description: string;
  iotData?: IoTDataPoint[];
  soilData?: SoilData;
  satelliteImage?: string;
  aiAnalysis?: {
    summary: string;
    riskAlerts: string[];
    confidence: string;
  };
  history?: {
    date: string;
    advice: string;
  }[];
  // New Fields
  timeline?: TimelineEvent[];
  healthSnapshot?: FieldHealthSnapshot;
  dataConfidence?: DataConfidence;
}

export interface Report {
  requestId: string;
  problemSummary: string;
  diagnosis: string;
  recommendation: string;
  fertilizerAdvice: string;
  urgencyLevel: Urgency;
  followUpRequired: boolean;
  followUpDays?: number;
  submittedAt: string;
  dataLimitationAcknowledged: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'EXPERT';
  region: string;
  qualification: string;
  experience: string;
  isVerified: boolean;
  avatar: string;
  bio: string;
}