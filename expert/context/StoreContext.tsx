import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { ExpertRequest, User, RequestStatus, Urgency } from '../types';
import { MOCK_REQUESTS } from '../constants';

import axios from 'axios';

interface State {
  user: User | null;
  requests: ExpertRequest[];
  isOnline: boolean;
  earnings: number;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_ONLINE_STATUS' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: RequestStatus } }
  | { type: 'ADD_EARNINGS'; payload: number }
  | { type: 'SET_REQUESTS'; payload: ExpertRequest[] }
  | { type: 'ADD_REQUEST'; payload: ExpertRequest }
  | { type: 'REMOVE_REQUEST'; payload: string }
  | { type: 'SET_EARNINGS'; payload: number };

const storedUser = localStorage.getItem('user');
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const initialState: State = {
  user: parsedUser,
  requests: [], // Start empty, fetch on load
  isOnline: parsedUser?.is_online || false, // Initialize from user data
  earnings: 0,
};

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  // socket removed
}>({
  state: initialState,
  dispatch: () => null,
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, requests: [] };
    case 'TOGGLE_ONLINE_STATUS':
      return { ...state, isOnline: !state.isOnline };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        requests: state.requests.map((req) =>
          req.id === action.payload.id ? { ...req, status: action.payload.status } : req
        ),
      };
    case 'ADD_EARNINGS':
      return { ...state, earnings: state.earnings + action.payload };
    case 'SET_EARNINGS': // Handled via dispatch from profile fetch
      return { ...state, earnings: action.payload };
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload };
    case 'ADD_REQUEST':
      // Avoid duplicates
      if (state.requests.find(r => r.id === action.payload.id)) return state;
      return { ...state, requests: [action.payload, ...state.requests] };
    case 'REMOVE_REQUEST':
      return { ...state, requests: state.requests.filter(r => r.id !== action.payload) };
    default:
      return state;
  }
};

// ... (StoreProvider logic)


export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // WebSocket Logic has been moved to NotificationService and Layout.tsx
  // This prevents double interactions and race conditions.

  // Fetch API Requests on Load

  // Fetch Profile & Restore Session on Load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token by fetching profile
          const API_URL = 'http://127.0.0.1:8000/api/v1';
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const profile = response.data;

          const user: User = {
            id: profile.id || 'unknown',
            name: profile.personalDetails?.name || 'Expert',
            email: '', // Not strictly needed or can be in                    phone: profile.personalDetails?.phone || '',
            role: 'expert' as any, // Cast to any or UserRole if imported
            region: profile.personalDetails?.district || '',
            qualification: '',
            experience: '',
            isVerified: profile.verified,
            avatar: profile.personalDetails?.profilePicture,
            bio: profile.personalDetails?.bio
          };

          dispatch({ type: 'LOGIN', payload: user });
        } catch (error) {
          console.error("Session restoration failed", error);
          localStorage.removeItem('token'); // Invalid token
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (state.user) {
      fetchRequests();
      fetchProfileStatus();
    }
  }, [state.user]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = 'http://127.0.0.1:8000/api/v1';
      const res = await axios.get(`${API_URL}/consultations/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      // Map API data to ExpertRequest interface
      const mappedRequests: ExpertRequest[] = data.map((apiReq: any) => ({
        id: apiReq.id.toString(),
        farmer: {
          id: apiReq.farmer.id.toString(),
          name: apiReq.farmer.name,
          phone: apiReq.farmer.phone,
          location: 'Unknown', // Placeholder
          avatar: apiReq.farmer.profile_picture || `https://ui-avatars.com/api/?name=${apiReq.farmer.name}&background=random`,
          experienceLevel: 'Intermediate',
          fields: apiReq.farmer.fields || [],
        },
        status: apiReq.status === 'PENDING' ? RequestStatus.NEW :
          (apiReq.status === 'ACCEPTED' ? RequestStatus.IN_PROGRESS :
            (apiReq.status === 'REJECTED' ? RequestStatus.REJECTED : RequestStatus.COMPLETED)),
        urgency: Urgency.MEDIUM, // Default
        assignedDate: apiReq.created_at,
        issueType: apiReq.issue_type,
        description: apiReq.description,
        aiAnalysis: apiReq.ai_analysis || {
          summary: "Based on the satellite imagery and available data, there is a high likelihood of fungal infection triggered by recent high humidity levels. The soil nitrogen levels also appear lower than optimal for this crop stage.",
          riskAlerts: ["Fungal Infection Risk", "Low Nitrogen"],
          confidence: "High (85%)"
        },
        // Use specific field details if available, otherwise profile fallback
        field: apiReq.field_details ? {
          id: apiReq.field_details.id,
          name: apiReq.field_details.name,
          area: `${apiReq.field_details.area} acres`,
          crop: apiReq.field_details.crop || 'N/A',
          harvestTimeline: 'N/A',
          coordinates: apiReq.field_details.center
            ? [apiReq.field_details.center.lat, apiReq.field_details.center.lng]
            : [23.8103, 90.4125]
        } : {
          name: 'General Farm Profile',
          area: apiReq.farmer.farm_size ? `${apiReq.farmer.farm_size} acres` : 'N/A',
          crop: apiReq.farmer.crop_type || 'N/A',
          harvestTimeline: 'N/A', // Not in profile yet
          coordinates: [23.8103, 90.4125] // Default generic location (Dhaka)
        }
      }));
      dispatch({ type: 'SET_REQUESTS', payload: mappedRequests });
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = 'http://127.0.0.1:8000/api/v1';
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = res.data;

      // Sync local state with backend state on load
      if (profile.is_online !== state.isOnline) {
        console.log("Syncing Profile Status: ", profile.is_online);
        dispatch({ type: 'SET_ONLINE_STATUS', payload: profile.is_online });
      }
      // Sync earnings
      if (profile.earnings !== undefined) {
        dispatch({ type: 'SET_EARNINGS', payload: parseFloat(profile.earnings) });
      }
    } catch (error) {
      console.error("Failed to fetch profile status", error);
    }
  };

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);