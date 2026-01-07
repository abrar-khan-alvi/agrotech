import React, { useState, useRef, useEffect } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { 
  Layers, Map as MapIcon, Wifi, Activity, Droplets, Zap, 
  User, ChevronRight,
  ZoomIn, ZoomOut, Maximize, Filter, Database
} from 'lucide-react';
import { Field, IoTDevice } from '../types';

// Mock Data optimized for Map Visualization
const MOCK_MAP_FIELDS: Field[] = [
  { 
    id: 'F-101', ownerName: 'John Doe', location: 'Northern Region', area: 12.5, crop: 'Wheat', status: 'ACTIVE', 
    riskLevel: 'LOW', soilHealth: 85,
    coordinates: "M 10 10 L 40 10 L 40 40 L 10 40 Z" // Square
  },
  { 
    id: 'F-102', ownerName: 'Jane Smith', location: 'Eastern Valley', area: 5.0, crop: 'Rice', status: 'ACTIVE', 
    riskLevel: 'HIGH', soilHealth: 45,
    coordinates: "M 45 15 L 85 15 L 90 50 L 50 60 Z" // Irregular
  },
  { 
    id: 'F-103', ownerName: 'Robert Johnson', location: 'Western Plains', area: 25.0, crop: 'Corn', status: 'RESTING', 
    riskLevel: 'MEDIUM', soilHealth: 62,
    coordinates: "M 10 50 L 40 50 L 35 90 L 5 80 Z" // Trapezoid
  },
  {
    id: 'F-104', ownerName: 'Emily Davis', location: 'Southern Hills', area: 18.2, crop: 'Soybean', status: 'ACTIVE',
    riskLevel: 'LOW', soilHealth: 92,
    coordinates: "M 50 65 L 90 55 L 95 90 L 55 95 Z"
  }
];

const MOCK_MAP_DEVICES: IoTDevice[] = [
  { id: 'IOT-A1', type: 'SOIL_SENSOR', location: 'F-101', assignedTo: 'Mark W.', samplingSessionId: 'S-2024-001', coordinates: { x: 25, y: 25 } },
  { id: 'IOT-B2', type: 'WEATHER_STATION', location: 'F-102', assignedTo: 'Sarah L.', coordinates: { x: 65, y: 35 } },
  { id: 'IOT-C3', type: 'SOIL_SENSOR', location: 'F-102 (Edge)', assignedTo: 'Sarah L.', samplingSessionId: 'S-2024-002', coordinates: { x: 80, y: 45 } },
  { id: 'IOT-D4', type: 'DRONE_BASE', location: 'Central Hub', assignedTo: 'Tech', coordinates: { x: 45, y: 55 } },
];

const SAMPLING_POINTS = [
  { id: 'S-1', x: 20, y: 20, value: 'pH 6.5' },
  { id: 'S-2', x: 70, y: 30, value: 'pH 5.8' },
  { id: 'S-3', x: 30, y: 70, value: 'pH 6.2' },
];

export const MapView: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState({
    fields: true,
    iot: true,
    sampling: false,
    floodRisk: false,
    salinity: false
  });
  const [selectedObject, setSelectedObject] = useState<Field | IoTDevice | null>(null);
  const [selectedType, setSelectedType] = useState<'FIELD' | 'DEVICE' | null>(null);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleFieldClick = (field: Field) => {
    setSelectedObject(field);
    setSelectedType('FIELD');
  };

  const handleDeviceClick = (device: IoTDevice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent map click
    setSelectedObject(device);
    setSelectedType('DEVICE');
  };

  const getRiskColor = (level?: string) => {
    switch(level) {
      case 'HIGH': return 'fill-rose-500/40 stroke-rose-600';
      case 'MEDIUM': return 'fill-amber-500/40 stroke-amber-600';
      default: return 'fill-emerald-500/40 stroke-emerald-600';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 relative">
      
      {/* --- Sidebar Controls --- */}
      <div className="w-full lg:w-64 flex flex-col gap-4 z-10">
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <Layers size={16} className="mr-2 text-slate-500" />
            Map Layers
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => toggleLayer('fields')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-all ${activeLayers.fields ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="flex items-center"><MapIcon size={14} className="mr-2"/> Fields</span>
              <div className={`w-2 h-2 rounded-full ${activeLayers.fields ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>
            <button 
              onClick={() => toggleLayer('iot')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-all ${activeLayers.iot ? 'bg-blue-50 border-blue-200 text-blue-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="flex items-center"><Wifi size={14} className="mr-2"/> IoT Devices</span>
              <div className={`w-2 h-2 rounded-full ${activeLayers.iot ? 'bg-blue-500' : 'bg-slate-300'}`} />
            </button>
            <button 
              onClick={() => toggleLayer('sampling')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-all ${activeLayers.sampling ? 'bg-purple-50 border-purple-200 text-purple-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="flex items-center"><Activity size={14} className="mr-2"/> Sampling</span>
              <div className={`w-2 h-2 rounded-full ${activeLayers.sampling ? 'bg-purple-500' : 'bg-slate-300'}`} />
            </button>
            
            <div className="pt-2 border-t border-slate-100 mt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Risk Analysis</span>
              <button 
                onClick={() => toggleLayer('floodRisk')}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border mb-2 transition-all ${activeLayers.floodRisk ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="flex items-center"><Droplets size={14} className="mr-2"/> Flood Risk</span>
                {activeLayers.floodRisk && <Badge variant="warning">High</Badge>}
              </button>
               <button 
                onClick={() => toggleLayer('salinity')}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm border transition-all ${activeLayers.salinity ? 'bg-amber-50 border-amber-200 text-amber-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="flex items-center"><Zap size={14} className="mr-2"/> Salinity</span>
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex-1">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <Filter size={16} className="mr-2 text-slate-500" />
            Filters
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Region</label>
              <select className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option>All Regions</option>
                <option>Northern</option>
                <option>Eastern</option>
                <option>Southern</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Crop Type</label>
              <select className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option>All Crops</option>
                <option>Wheat</option>
                <option>Rice</option>
                <option>Corn</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* --- Main Map Area --- */}
      <div className="flex-1 relative bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200 group">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button onClick={() => handleZoom(0.2)} className="bg-white p-2 rounded-lg shadow-md text-slate-600 hover:text-emerald-600 hover:bg-slate-50">
            <ZoomIn size={20} />
          </button>
          <button onClick={() => handleZoom(-0.2)} className="bg-white p-2 rounded-lg shadow-md text-slate-600 hover:text-emerald-600 hover:bg-slate-50">
            <ZoomOut size={20} />
          </button>
          <button className="bg-white p-2 rounded-lg shadow-md text-slate-600 hover:text-emerald-600 hover:bg-slate-50">
            <Maximize size={20} />
          </button>
        </div>

        {/* The Map "Engine" (Interactive SVG) */}
        <div 
          ref={mapRef}
          className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative bg-[#e5e9ec]"
          onClick={() => { setSelectedObject(null); setSelectedType(null); }}
        >
          {/* Map Grid Pattern Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ 
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
              backgroundSize: `${20 * zoom}px ${20 * zoom}px` 
            }} 
          />
          
          <div 
            className="w-full h-full transition-transform duration-300 ease-out origin-center relative"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Flood Layer */}
            {activeLayers.floodRisk && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 0 60 Q 50 40 100 70 V 100 H 0 Z" fill="rgba(6, 182, 212, 0.15)" />
              </svg>
            )}

            {/* Field Polygons Layer */}
            {activeLayers.fields && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {MOCK_MAP_FIELDS.map((field) => (
                  <path
                    key={field.id}
                    d={field.coordinates}
                    className={`
                      cursor-pointer transition-all duration-300 hover:opacity-80
                      ${getRiskColor(field.riskLevel)}
                      ${selectedObject?.id === field.id ? 'stroke-[1px] stroke-slate-900 opacity-100' : 'stroke-[0.5px]'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldClick(field);
                    }}
                  />
                ))}
              </svg>
            )}

            {/* Sampling Points Layer */}
            {activeLayers.sampling && SAMPLING_POINTS.map((p) => (
              <div 
                key={p.id}
                className="absolute w-2 h-2 bg-purple-500 rounded-full border border-white shadow-sm hover:scale-150 transition-transform cursor-pointer"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                title={p.value}
              />
            ))}

            {/* IoT Markers Layer */}
            {activeLayers.iot && MOCK_MAP_DEVICES.map((device) => (
              <div
                key={device.id}
                className={`
                  absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110 z-20 bg-blue-600 text-white
                  ${selectedObject?.id === device.id ? 'ring-2 ring-slate-900 scale-125' : ''}
                `}
                style={{ left: `${device.coordinates?.x}%`, top: `${device.coordinates?.y}%` }}
                onClick={(e) => handleDeviceClick(device, e)}
              >
                {device.type === 'SOIL_SENSOR' ? <Activity size={12} /> : device.type === 'WEATHER_STATION' ? <Wifi size={12} /> : <Zap size={12} />}
              </div>
            ))}
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-600 z-10">
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-emerald-100 border border-emerald-500 rounded-sm"></div> Healthy Crop</div>
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded-sm"></div> Medium Risk</div>
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-rose-100 border border-rose-500 rounded-sm"></div> High Risk</div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
             <div className="w-3 h-3 rounded-full bg-blue-600"></div> IoT Device
          </div>
        </div>
      </div>

      {/* --- Context Panel (Right Side) --- */}
      {selectedObject && (
        <div className="absolute lg:relative right-0 top-0 h-full w-full lg:w-80 bg-white shadow-xl lg:shadow-none lg:rounded-xl border-l border-slate-200 z-30 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900">
              {selectedType === 'FIELD' ? 'Field Details' : 'Device Info'}
            </h3>
            <button onClick={() => setSelectedObject(null)} className="text-slate-400 hover:text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            {selectedType === 'FIELD' ? (
              // Field Context
              <div className="space-y-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 mb-1">{(selectedObject as Field).location}</h2>
                   <p className="text-sm text-slate-500">Owned by {(selectedObject as Field).ownerName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <span className="text-xs text-emerald-600 uppercase font-bold block mb-1">Soil Health</span>
                    <span className="text-2xl font-bold text-slate-900">{(selectedObject as Field).soilHealth}</span>
                    <span className="text-sm text-slate-500"> / 100</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <span className="text-xs text-blue-600 uppercase font-bold block mb-1">Crop Type</span>
                    <span className="text-lg font-bold text-slate-900">{(selectedObject as Field).crop}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 border-b pb-1">Risk Factors</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Flood Risk</span>
                    <Badge variant={activeLayers.floodRisk ? 'warning' : 'success'}>
                       {activeLayers.floodRisk ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Pest Probability</span>
                    <Badge variant={(selectedObject as Field).riskLevel === 'HIGH' ? 'error' : 'neutral'}>
                      {(selectedObject as Field).riskLevel}
                    </Badge>
                  </div>
                </div>

                <Button className="w-full mt-4">Generate Field Report</Button>
              </div>
            ) : (
              // Device Context (Simplified)
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <Wifi size={24} />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-slate-900">{(selectedObject as IoTDevice).id}</h2>
                     <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                       {(selectedObject as IoTDevice).type.replace('_', ' ')}
                     </span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User size={16} /> Assigned To
                      </div>
                      <span className="font-medium text-slate-900">{(selectedObject as IoTDevice).assignedTo}</span>
                   </div>

                   {(selectedObject as IoTDevice).samplingSessionId && (
                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                          <Database size={16} /> Active Session
                        </div>
                        <span className="font-bold text-blue-800">{(selectedObject as IoTDevice).samplingSessionId}</span>
                     </div>
                   )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Edit Assignment</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};