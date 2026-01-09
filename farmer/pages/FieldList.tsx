import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const FieldList: React.FC = () => {
  const { fields, user, removeField } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">আমার জমি</h1>
          <p className="text-gray-500 text-sm flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            স্বাগতম, <span className="font-semibold ml-1 text-gray-700">{user?.name}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-leaf-600 shadow-sm">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-800">{fields.length}</p>
            <p className="text-xs text-gray-500">মোট জমি</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Add New Field Button */}
        <button
          onClick={() => navigate('/field/add')}
          className="bg-leaf-50/50 border-2 border-dashed border-leaf-300 rounded-2xl flex flex-col items-center justify-center space-y-3 text-leaf-600 hover:bg-leaf-50 hover:border-leaf-500 hover:shadow-md transition-all duration-300 min-h-[200px] group"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-leaf-600 group-hover:text-white transition-all duration-300">
            <i className="fa-solid fa-plus text-2xl"></i>
          </div>
          <span className="font-bold text-lg group-hover:translate-y-1 transition-transform">নতুন জমি</span>
        </button>

        {fields.map((field) => (
          <div
            key={field.id}
            onClick={() => navigate(`/field/${field.id}/dashboard`)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-leaf-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[200px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-leaf-50 rounded-bl-[100%] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

            <div className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-leaf-100 text-leaf-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-2">
                  <i className="fa-solid fa-seedling"></i>
                </div>
                <div className="flex space-x-2">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 flex items-center h-8">
                    {field.area_in_acres ? `${field.area_in_acres} একর` : 'N/A'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors z-20"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-leaf-700 transition-colors line-clamp-1">{field.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{field.crop_type || 'ফসল নেই'}</p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center">
                  <i className="fa-regular fa-clock mr-1"></i> {field.created_at ? new Date(field.created_at).toLocaleDateString('bn-BD') : 'N/A'}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-leaf-600 group-hover:text-white transition-all">
                  <i className="fa-solid fa-arrow-right text-sm"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldList;