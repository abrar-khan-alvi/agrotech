import { ref, set, onValue, off, push, update } from "firebase/database";
import { db } from "./firebaseConfig";

// Node References based on User Request:
// ShonaliDesh/
//   farmers/
//   experts/
//   consultations/
//   farm/

export const FirebaseService = {
    // --- CONSULTATIONS ---

    // Create or Update a Consultation Request
    updateConsultation: async (requestId: string, data: any) => {
        try {
            const requestRef = ref(db, `ShonaliDesh/consultations/${requestId}`);
            await update(requestRef, data);
            console.log("Firebase: Consultation updated", requestId);
        } catch (error) {
            console.error("Firebase Update Error:", error);
        }
    },

    // Listen to a specific Request (e.g., for status updates)
    listenToRequest: (requestId: string, callback: (data: any) => void) => {
        const requestRef = ref(db, `ShonaliDesh/consultations/${requestId}`);
        const unsubscribe = onValue(requestRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data);
            }
        });
        // Return unsubscribe function
        return () => off(requestRef);
    },

    // Listen to ALL requests (e.g., for Expert Dashboard)
    // Logic: In real app, filter by Expert ID or unassigned
    listenToAllRequests: (callback: (data: any) => void) => {
        const requestsRef = ref(db, `ShonaliDesh/consultations`);
        const unsubscribe = onValue(requestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert object to array
                const requestsArray = Object.values(data);
                callback(requestsArray);
            } else {
                callback([]);
            }
        });
        return () => off(requestsRef);
    },

    // --- USERS (Simulation of Sync) ---

    updateExpertStatus: async (userId: string, isOnline: boolean) => {
        const userRef = ref(db, `ShonaliDesh/experts/${userId}`);
        await update(userRef, { isOnline });
    }
};
