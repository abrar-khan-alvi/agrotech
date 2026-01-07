import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { RequestStatus } from '../types';
import {
  Phone, MessageSquare, FileText, ArrowLeft, BrainCircuit,
  Droplets, Activity, MapPin, Sprout, Sun, Wind, Thermometer,
  Calendar, CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';
import { expert } from '../services/api';
import { fetchWeather, WeatherData } from '../services/weatherService';

import toast from 'react-hot-toast';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const request = state.requests.find(r => r.id === id);
  const [updating, setUpdating] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (request?.field?.coordinates) {
      let [lat, lng] = request.field.coordinates;
      if (Math.abs(lat) > 90) {
        [lat, lng] = [lng, lat];
      }
      fetchWeather(lat, lng).then(data => setWeather(data));
    } else {
      fetchWeather(23.8103, 90.4125).then(data => setWeather(data));
    }
  }, [request]);

  if (!request) return <div className="p-8 text-center text-gray-500 font-medium">Request not found</div>;

  const handleAccept = async () => {
    setUpdating(true);
    try {
      await expert.updateRequestStatus(request.id, 'ACCEPTED');
      dispatch({
        type: 'UPDATE_REQUEST_STATUS',
        payload: { id: request.id, status: RequestStatus.IN_PROGRESS }
      });
      toast.success("Consultation Accepted!");
    } catch (err) {
      toast.error("Failed to accept request");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    setUpdating(true);
    try {
      await expert.updateRequestStatus(request.id, 'REJECTED');
      dispatch({
        type: 'UPDATE_REQUEST_STATUS',
        payload: { id: request.id, status: RequestStatus.REJECTED }
      });
      toast.success("Request Rejected");
      navigate(-1);
    } catch (err) {
      toast.error("Failed to reject request");
    } finally {
      setUpdating(false);
    }
  };

  const statusList = {
    [RequestStatus.NEW]: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'New Request' },
    [RequestStatus.IN_PROGRESS]: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'In Progress' },
    [RequestStatus.COMPLETED]: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Completed' },
    [RequestStatus.REJECTED]: { color: 'bg-red-50 text-red-700 border-red-100', label: 'Rejected' },
  };

  const currentStatus = statusList[request.status] || statusList[RequestStatus.NEW];

  return (
    <div className="bg-slate-50 min-h-screen md:pl-72 pb-32">
      {/* 🔹 Header Section */}

      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Consultation Details</h1>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                Assigned {new Date(request.assignedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 🔸 LEFT COLUMN: Farmer & Field (4 cols) */}
          <div className="lg:col-span-4 space-y-6 block">

            {/* Farmer Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img src={request.farmer.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg shadow-gray-100" alt="Farmer" />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{request.farmer.name}</h2>
                <p className="text-sm text-gray-500 font-medium mb-4">{request.farmer.experienceLevel}</p>

                <div className="flex gap-2 w-full">
                  <button className="flex-1 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                  <button className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                  <span className="font-semibold text-slate-700">{request.farmer.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Sprout className="w-4 h-4" /> Fields</span>
                  <span className="font-semibold text-slate-700">{request.farmer.fields?.length || 0} Registered</span>
                </div>
              </div>
            </div>

            {/* Field Context Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Field Context</h3>

              {request.field ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{request.field.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Verified Field Data</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-400 mb-1">Crop Type</p>
                      <p className="font-bold text-slate-800">{request.field.crop}</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-400 mb-1">Area Size</p>
                      <p className="font-bold text-slate-800">{request.field.area}</p>
                    </div>
                  </div>

                  {request.satelliteImage && (
                    <div className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer">
                      <img src={request.satelliteImage} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Sat" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        SATELLITE
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No field data available</div>
              )}
            </div>

          </div>

          {/* 🔸 RIGHT COLUMN: Analysis & Data (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 🧠 AI Analysis Hero Card */}
            {request.aiAnalysis && (
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-1 shadow-[0_2px_20px_rgba(99,102,241,0.06)] border border-indigo-100">
                <div className="bg-white/60 backdrop-blur-sm rounded-[20px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800">AI Diagnostic Insight</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-600">Confidence Score</span>
                      <div className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-600/20">
                        {request.aiAnalysis.confidence}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm mb-5">
                    {request.aiAnalysis.summary}
                  </p>

                  {request.aiAnalysis.riskAlerts?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {request.aiAnalysis.riskAlerts.map((alert, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                          <AlertTriangle className="w-3.5 h-3.5" /> {alert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Problem Description */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50">
              <span className="inline-block px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                Reported Issue
              </span>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{request.issueType}</h4>
              <p className="text-gray-600 text-sm leading-7">
                {request.description}
              </p>
            </div>

            {/* 📊 Real-time Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Weather Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-500" /> Climate & Soil
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Satellite Live Data • Open-Meteo</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/30"></div>
                </div>

                {weather ? (
                  <div className="flex-1 space-y-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-4xl font-black text-slate-800 tracking-tighter">{weather.temperature}°</div>
                        <div className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                          <Wind className="w-4 h-4" /> {weather.windspeed} km/h
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{weather.precipitation}mm</div>
                        <div className="text-xs text-gray-400 uppercase font-bold mt-1">Precipitation</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Soil Moisture</p>
                        <p className="font-bold text-slate-700">{(weather.soilReader.moisture * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Soil Temp</p>
                        <p className="font-bold text-slate-700">{weather.soilReader.temperature}°C</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                    Loading Weather...
                  </div>
                )}
              </div>

              {/* IoT Sensor Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full -mr-4 -mt-4" />

                <div className="flex justify-between items-start mb-6 relative">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-500" /> Sensor Network
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Local IoT Readings</p>
                  </div>
                </div>

                {request.iotData && request.iotData.length > 0 ? (
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="block text-xs text-emerald-600 font-bold mb-1">Moisture</span>
                        <span className="text-xl font-bold text-slate-800">{request.iotData[0].moisture}%</span>
                      </div>
                      <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-2xl">
                        <span className="block text-xs text-orange-600 font-bold mb-1">Temp</span>
                        <span className="text-xl font-bold text-slate-800">{request.iotData[0].temp}°C</span>
                      </div>
                    </div>
                    <div className="text-center pt-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Last Synced: {new Date(request.iotData[0].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-300">
                      <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No active sensors</p>
                    <button className="text-xs text-emerald-600 font-bold mt-2 hover:underline">Request Deployment</button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ⚡ FLOATING ACTION BAR */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-gray-200 pointer-events-auto flex items-center gap-2">

          {request.status === RequestStatus.NEW ? (
            <>
              <button
                onClick={handleReject}
                disabled={updating}
                className="flex-1 h-12 rounded-[1.5rem] hover:bg-red-50 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={updating}
                className="flex-[2] h-12 rounded-[1.5rem] bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {updating ? <Activity className="w-5 h-5 animate-spin" /> : 'Accept Request'}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate(`/expert/report/${request.id}`)}
              className={`flex-1 h-12 rounded-[1.5rem] font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2 ${request.status === RequestStatus.COMPLETED
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white'
                }`}
            >
              {request.status === RequestStatus.COMPLETED ? (
                <> <FileText className="w-4 h-4" /> View Report </>
              ) : (
                <> <FileText className="w-4 h-4" /> Write Report </>
              )}
            </button>
          )}

        </div>
      </div>

    </div >
  );
};