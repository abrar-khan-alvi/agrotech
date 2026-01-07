import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MessageSquare } from 'lucide-react';

export const ConsultationCall: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useStore();
  const request = state.requests.find(r => r.id === id);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  // Start "Call"
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    };

    startCamera();

    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Navigate to report page after call
    if (window.confirm("End consultation and proceed to report?")) {
      navigate(`/report/${id}`);
    }
  };

  if (!request) return <div>Invalid Request</div>;

  return (
    <div className="h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-10 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start">
        <div>
          <h2 className="text-white font-bold text-lg md:text-xl">{request.farmer.name}</h2>
          <p className="text-gray-300 text-xs md:text-sm">{request.farmer.location}</p>
        </div>
        <div className="bg-red-500/90 backdrop-blur px-3 py-1 rounded-full text-white font-mono text-xs md:text-sm shadow-lg">
          REC {formatTime(duration)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex md:grid md:grid-cols-2 h-full relative">
        
        {/* Remote Video (Farmer) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden relative">
          <img 
            src={request.farmer.avatar.replace('200', '800')} 
            alt="Farmer Feed" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute bottom-24 md:bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-white text-xs">
            {request.farmer.name} (Remote)
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Local Video (Self View) - Desktop: Top Right of Right Panel, Mobile: Floating PiP */}
        <div className="absolute top-16 right-4 w-32 h-24 md:static md:w-auto md:h-auto md:bg-gray-900 md:border-l md:border-gray-800 z-20">
           {/* Expert Camera Wrapper */}
           <div className="md:absolute md:top-4 md:right-4 w-full h-full md:w-48 md:h-36 bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
             <video 
               ref={localVideoRef} 
               autoPlay 
               muted 
               playsInline 
               className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`} 
             />
             {isVideoOff && (
               <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">
                 Off
               </div>
             )}
             <div className="absolute bottom-1 right-2 md:bottom-2 md:left-2 text-[10px] text-white bg-black/50 px-2 rounded">You</div>
           </div>

           {/* Call Context Info - Hidden on Mobile to save space */}
           <div className="hidden md:block p-8 mt-44">
             <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-4">Live Telemetry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block">Avg Moisture</span>
                    <span className="text-blue-400 font-mono text-lg font-bold">24%</span>
                  </div>
                   <div className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block">Temperature</span>
                    <span className="text-orange-400 font-mono text-lg font-bold">28°C</span>
                  </div>
                </div>
             </div>
             
             <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-4">Talking Points</h3>
                <ul className="text-gray-300 text-sm space-y-3 list-disc list-inside">
                  <li>Confirm irrigation schedule for last 48 hours.</li>
                  <li>Check for visible discoloration on lower leaves.</li>
                  <li>Ask about recent fertilizer application.</li>
                </ul>
             </div>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 md:gap-4 z-30 w-max max-w-full px-4 justify-center">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 md:p-4 rounded-full backdrop-blur-md transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        >
          {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3 md:p-4 rounded-full backdrop-blur-md transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <button 
          onClick={handleEndCall}
          className="p-4 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform scale-110 active:scale-95 transition-transform"
        >
          <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <button className="hidden sm:block p-3 md:p-4 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <button className="hidden sm:block p-3 md:p-4 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all">
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};