export enum RiskLevel {
  LOW = 'কম',
  MEDIUM = 'মাঝারি',
  HIGH = 'উচ্চ',
}

export enum IssueType {
  SOIL = 'মাটির স্বাস্থ্য',
  FLOOD = 'বন্যা/পানি',
  DISEASE = 'রোগ/পোকামাকড়',
  GENERAL = 'সাধারণ জিজ্ঞাসা',
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  nidUrl?: string; // Mock URL (deprecated)
  nid?: string;
  nid_photo?: string; // URL from backend
  profile_picture?: string; // URL from backend
  password?: string; // In real app, never store plain text
  verified?: boolean;
  role?: string;
}

export interface SoilHealth {
  nitrogen: 'Low' | 'Medium' | 'Good';
  phosphorus: 'Low' | 'Medium' | 'Good';
  potassium: 'Low' | 'Medium' | 'Good';
  phLevel: number;
}

export interface SensorData {
  moisture: string; // e.g. "35%"
  temperature: string; // e.g. "28°C"
  humidity: string; // e.g. "75%"
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Field {
  id: string;
  name: string;
  crop_type?: string; // Matches backend
  harvest_time?: string; // Matches backend
  area_in_acres: number;
  area?: string; // Frontend display string
  boundary?: Coordinate[];
  center?: Coordinate;
  created_at?: string;

  // Frontend computed/mock (optional)
  soilHealth?: SoilHealth;
  sensorData?: SensorData;
  lastUpdate?: string; // Frontend mock
  risks?: {
    flood: RiskLevel;
    salinity: RiskLevel;
    disease: RiskLevel;
  };
}

export interface IoTReading {
  id: number;
  field: number; // Field ID
  latitude?: number;
  longitude?: number;
  soil_temperature?: number;
  soil_moisture?: number;
  soil_ph?: number;
  soil_ec?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  recorded_at: string;
}

export interface ConsultationAdvice {
  id: number;
  consultation: number;
  expert: number;
  expert_name: string;
  advice: string;
  created_at: string;
}

export interface AIConsultation {
  id: number;
  field: number;
  advice: any; // Flexible JSON
  input_data?: any;
  created_at: string;
}

export interface ConsultationRequest {
  id: string;
  fieldId: string;
  issueType: IssueType;
  description: string;
  status: 'অপেক্ষমান' | 'নিযুক্ত' | 'সম্পন্ন';
  assignedExpert?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface Expert {
  id: string;
  user: number; // User ID for foreign keys
  name: string;
  specialization: string; // Changed from specialty
  is_online: boolean; // Changed from isOnline
  profile_picture: string; // Changed from avatarUrl
  title: string;
  experience_years: number;
  rating: number;
}

export interface Advisory {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'AI' | 'EXPERT';
  riskLevel: RiskLevel;
}

export interface ExpertAdviceData {
  problemSummary: string;
  diagnosis: string;
  recommendation: string;
  urgency: string;
  followUp: boolean;
  followUpDays?: number;
}

export interface ExpertConsultAdvice {
  id: number;
  expert: number; // ID
  field: number;
  advice: ExpertAdviceData;
  created_at: string;
}