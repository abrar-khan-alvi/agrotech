import React, { createContext, useContext } from 'react';
import { FarmerProfile, ConsultationRequest, RiskLevel, Field } from '../types';

interface AppContextType {
    user: FarmerProfile | null;
    login: (profile: FarmerProfile, token?: string) => void;
    logout: () => void;
    fields: Field[];
    addField: (field: Field) => void;
    updateField: (fieldId: string, updates: Partial<Field>) => void;
    removeField: (fieldId: string) => Promise<void>;
    requests: ConsultationRequest[];
    addRequest: (req: ConsultationRequest) => void;
    isRegistered: (phone: string) => boolean;
    lastExpertUpdate: { expertId: string; isOnline: boolean } | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within AppProvider");
    return context;
};
