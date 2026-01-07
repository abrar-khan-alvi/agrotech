type NotificationCallback = (data: any) => void;

class NotificationService {
    private socket: WebSocket | null = null;
    private callbacks: NotificationCallback[] = [];
    private reconnectInterval = 3000;
    private userId: string | null = null;

    constructor() { }

    connect(userId: string) {
        console.log("WebSocket Connection Disabled");
        return;

        /*
        
        this.socket.onopen = () => {
            console.log('Notification Service Connected');
        };
        
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    this.notifyListeners(data.payload);
                } else if (data.type === 'status_update') {
                    this.notifyListeners({ event: 'expert_status', data });
                }
            } catch (e) {
                console.error("Error parsing WebSocket message", e);
            }
        };
        
        this.socket.onclose = (event) => {
            console.log('Notification Service Disconnected.', event.reason);
            this.socket = null; // Clear instance
        
            // Only reconnect if we have a userId and it wasn't a clean close (optional check)
            // But we rely on the component calling disconnect() to clear this.userId if it's intentional
            if (this.userId) {
                console.log('Attempting Reconnect...');
                setTimeout(() => {
                    if (this.userId) this.connect(this.userId);
                }, this.reconnectInterval);
            }
        };
        
            console.error('WebSocket Error:', error);
        };
        */
    }

    onNotification(callback: NotificationCallback) {
        this.callbacks.push(callback);
    }

    private notifyListeners(payload: any) {
        this.callbacks.forEach(cb => cb(payload));
    }

    disconnect() {
        // Clear userId to prevent auto-reconnect
        this.userId = null;
        if (this.socket) {
            // Remove listeners to avoid triggering errors or reconnects during intentional close
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.onmessage = null;
            this.socket.onopen = null;
            this.socket.close();
            this.socket = null;
        }
    }
}

export const notificationService = new NotificationService();
