import { ExpertRequest, RequestStatus, Urgency } from './types';

// Generate some mock IoT data for charts
const generateIoTData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      moisture: Math.floor(Math.random() * 30) + 10,
      temp: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
    });
  }
  return data;
};

export const MOCK_REQUESTS: ExpertRequest[] = [
  {
    id: 'REQ-1001',
    farmer: {
      id: 'F-01',
      name: 'Rajesh Kumar',
      location: 'Rangpur, Bangladesh',
      phone: '+880 1712 345678',
      avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
      experienceLevel: 'Veteran (15+ Years)'
    },
    status: RequestStatus.NEW,
    urgency: Urgency.HIGH,
    assignedDate: '2023-10-25T09:00:00Z',
    issueType: 'Discoloration',
    description: 'Yellowing leaves reported in the north sector. Suspected nitrogen deficiency.',
    field: {
      name: 'North Sector A',
      area: '12 Acres',
      crop: 'Wheat',
      harvestTimeline: '3 Weeks',
      coordinates: [25.7439, 89.2752]
    },
    iotData: generateIoTData(),
    soilData: {
      lastSampleDate: '2023-10-20',
      nitrogen: 'Low',
      phosphorus: 'Adequate',
      potassium: 'High',
      phLevel: 6.5,
      confidenceScore: 88
    },
    satelliteImage: 'https://picsum.photos/seed/sat1/800/600',
    aiAnalysis: {
      summary: 'High probability of Nitrogen deficiency based on spectral analysis.',
      riskAlerts: ['Yield reduction risk: 15%', 'Fungal infection risk: Low'],
      confidence: 'High'
    },
    history: [
      { date: '2023-08-15', advice: 'Recommended pre-sowing soil treatment.' }
    ],
    timeline: [
      { status: 'Request Created', timestamp: '2023-10-25T08:30:00Z' },
      { status: 'Auto-Assigned to Expert', timestamp: '2023-10-25T09:00:00Z' }
    ],
    healthSnapshot: {
      soilHealth: 'Moderate',
      salinity: 'Low',
      floodRisk: 'Low',
      diseaseRisk: 'Medium'
    },
    dataConfidence: {
      level: 'High',
      lastIoTUpdate: '15 mins ago',
      samplingPoints: 4
    }
  },
  {
    id: 'REQ-1002',
    farmer: {
      id: 'F-02',
      name: 'Sarah Jenkins',
      location: 'Iowa, USA',
      phone: '+1 555 019 2834',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random',
      experienceLevel: 'Intermediate (5 Years)'
    },
    status: RequestStatus.IN_PROGRESS,
    urgency: Urgency.MEDIUM,
    assignedDate: '2023-10-24T14:30:00Z',
    issueType: 'Pest Control',
    description: 'Automated traps triggered alert level 3. Corn borer suspected.',
    field: {
      name: 'Field 42',
      area: '450 Acres',
      crop: 'Corn',
      harvestTimeline: '2 Months',
      coordinates: [41.8780, -93.0977]
    },
    iotData: generateIoTData(),
    soilData: {
      lastSampleDate: '2023-09-01',
      nitrogen: 'Adequate',
      phosphorus: 'Adequate',
      potassium: 'Adequate',
      phLevel: 7.0,
      confidenceScore: 95
    },
    satelliteImage: 'https://picsum.photos/seed/sat2/800/600',
    aiAnalysis: {
      summary: 'Pest density increasing in quadrant 4.',
      riskAlerts: ['Immediate spray recommended'],
      confidence: 'Medium'
    },
    history: [],
    timeline: [
      { status: 'Request Created', timestamp: '2023-10-24T14:00:00Z' },
      { status: 'Assigned', timestamp: '2023-10-24T14:30:00Z' },
      { status: 'Call Started', timestamp: '2023-10-24T15:00:00Z', note: 'Video call' }
    ],
    healthSnapshot: {
      soilHealth: 'Good',
      salinity: 'Low',
      floodRisk: 'Low',
      diseaseRisk: 'High'
    },
    dataConfidence: {
      level: 'Medium',
      lastIoTUpdate: '3 hours ago',
      samplingPoints: 2,
      warning: 'Sensor 4 offline'
    }
  },
  {
    id: 'REQ-1003',
    farmer: {
      id: 'F-03',
      name: 'Abdul Haque',
      location: 'Sylhet, Bangladesh',
      phone: '+880 1812 987654',
      avatar: 'https://ui-avatars.com/api/?name=Abdul+Haque&background=random',
      experienceLevel: 'Beginner (2 Years)'
    },
    status: RequestStatus.COMPLETED,
    urgency: Urgency.LOW,
    assignedDate: '2023-10-20T10:00:00Z',
    issueType: 'Routine Checkup',
    description: 'Routine soil composition analysis request post-harvest.',
    field: {
      name: 'East Plot',
      area: '200 Hectares',
      crop: 'Tea',
      harvestTimeline: 'Harvested',
      coordinates: [24.8949, 91.8687]
    },
    iotData: generateIoTData(),
    soilData: {
      lastSampleDate: '2023-10-18',
      nitrogen: 'Adequate',
      phosphorus: 'Low',
      potassium: 'Adequate',
      phLevel: 5.5,
      confidenceScore: 92
    },
    satelliteImage: 'https://picsum.photos/seed/sat3/800/600',
    aiAnalysis: {
      summary: 'Soil acidity optimal for tea. Phosphorus supplementation needed.',
      riskAlerts: [],
      confidence: 'High'
    },
    history: [
       { date: '2023-05-10', advice: 'Monitor pH levels during monsoon.' }
    ],
    timeline: [
      { status: 'Request Created', timestamp: '2023-10-20T09:00:00Z' },
      { status: 'Report Submitted', timestamp: '2023-10-20T10:45:00Z' }
    ],
    healthSnapshot: {
      soilHealth: 'Excellent',
      salinity: 'Low',
      floodRisk: 'Medium',
      diseaseRisk: 'Low'
    },
    dataConfidence: {
      level: 'Low',
      lastIoTUpdate: '5 days ago',
      samplingPoints: 1,
      warning: 'Data potentially outdated'
    }
  }
];