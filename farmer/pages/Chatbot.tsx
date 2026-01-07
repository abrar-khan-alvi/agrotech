import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateAgriAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAppContext } from '../context/AppContext';

const Chatbot: React.FC = () => {
  const { user, fields } = useAppContext();
  const { fieldId } = useParams();
  const field = fields.find(f => f.id === fieldId);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `স্বাগতম ${user?.name}! আমি আপনার কৃষি সহকারী। "${field?.name}" এর ব্যাপারে কি জানতে চান?`,
      timestamp: Date.now(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Build Detailed Context String
      const context = `
        Farmer: ${user?.name}, Location: ${user?.address}, ${user?.upazila}, ${user?.district}.
        Field: ${field?.name} (${field?.area}).
        Crop: ${field?.crop || 'Not set'}, Harvest Time: ${field?.harvestTime || 'Not set'}.
        
        Real-time Sensor Data:
        - Soil Moisture: ${field?.sensorData.moisture}
        - Temperature: ${field?.sensorData.temperature}
        - Humidity: ${field?.sensorData.humidity}
        
        Soil Nutrients: N=${field?.soilHealth.nitrogen}, P=${field?.soilHealth.phosphorus}, K=${field?.soilHealth.potassium}, pH=${field?.soilHealth.phLevel}.
        
        Risks: Flood=${field?.risks.flood}, Disease=${field?.risks.disease}.
      `;

      const aiText = await generateAgriAdvice(userText, context);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "দুঃখিত, সংযোগে সমস্যা হচ্ছে।",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Responsive container height: adapts to mobile safe areas and bottom nav
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-110px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">

      {/* Context Banner */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 text-xs md:text-sm text-blue-700 flex items-center justify-between shrink-0">
        <div className="flex items-center truncate">
          <i className="fa-solid fa-seedling mr-2 text-blue-500"></i>
          <span className="font-medium truncate max-w-[150px]">{field?.crop || 'ফসল'}</span>
        </div>
        <div className="flex items-center bg-blue-100 px-2 py-1 rounded-lg">
          <i className="fa-solid fa-droplet mr-1.5 text-blue-500"></i>
          <span className="font-bold">{field?.sensorData.moisture}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-leaf-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none flex space-x-1 shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-leaf-500 focus:border-transparent outline-none text-sm md:text-base transition-shadow"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 md:w-14 md:h-14 bg-leaf-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-leaf-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;