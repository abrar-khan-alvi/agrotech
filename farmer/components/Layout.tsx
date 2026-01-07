import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, fields } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to get fieldId from path since useParams matches route definition
  const pathParts = location.pathname.split('/');
  // Determine if we are inside a specific field context (Dashboard, Experts, Chat, Settings)
  const isFieldRoute = pathParts[1] === 'field' && pathParts[2] && pathParts[2] !== 'add';
  const currentFieldId = isFieldRoute ? pathParts[2] : null;
  const currentField = fields.find(f => f.id === currentFieldId);

  // Show Sidebar/BottomNav only when inside a specific field
  const showSidebar = isFieldRoute;

  const navItems = [
    { label: 'ড্যাশবোর্ড', icon: 'fa-house-chimney', path: `/field/${currentFieldId}/dashboard` },
    { label: 'বিশেষজ্ঞ', icon: 'fa-user-doctor', path: `/field/${currentFieldId}/experts` },
    { label: 'চ্যাট', icon: 'fa-robot', path: `/field/${currentFieldId}/chat` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* Desktop Sidebar (Only visible if inside a field context) */}
      {showSidebar && (
        <aside className="hidden lg:flex flex-col w-64 bg-leaf-900 text-white fixed h-full z-40 shadow-xl overflow-y-auto">
          <div className="p-6 flex items-center space-x-3 border-b border-leaf-800 shrink-0">
            <img src="/logo.png" alt="Shonali Desh Logo" className="w-10 h-10 rounded-full bg-white object-contain p-1" />
            <div>
              <h1 className="font-bold text-lg tracking-wide">Shonali Desh Farmer</h1>
              <p className="text-xs text-leaf-300">কৃষকের বন্ধু</p>
            </div>
          </div>

          <div className="px-4 py-6 bg-leaf-800 shrink-0">
            <p className="text-xs text-leaf-300 uppercase mb-2 font-semibold tracking-wider">বর্তমান জমি</p>
            <div className="flex items-center space-x-3 font-semibold bg-leaf-900/50 p-3 rounded-lg border border-leaf-700/50">
              <i className="fa-solid fa-seedling text-leaf-400"></i>
              <span className="truncate text-sm">{currentField?.name}</span>
            </div>
            <button onClick={() => navigate('/fields')} className="text-xs text-leaf-300 hover:text-white mt-3 flex items-center transition-colors group w-full">
              <i className="fa-solid fa-arrow-left mr-1 group-hover:-translate-x-1 transition-transform"></i> সকল জমি দেখুন
            </button>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname.includes(item.path.split('/').pop() || '')
                  ? 'bg-leaf-700 text-white shadow-lg shadow-leaf-900/20 translate-x-1'
                  : 'text-leaf-100 hover:bg-leaf-800 hover:text-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${location.pathname.includes(item.path.split('/').pop() || '') ? 'bg-white/10' : 'group-hover:bg-white/5'
                  }`}>
                  <i className={`fa-solid ${item.icon} text-sm`}></i>
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

        </aside>
      )}

      {/* Header (Visible on Mobile/Tablet always, and on Desktop ONLY if sidebar is hidden) */}
      <header className={`${showSidebar ? 'lg:hidden' : ''} bg-leaf-900 text-white sticky top-0 z-30 shadow-md transition-all`}>
        <div className="max-w-5xl mx-auto w-full px-4 h-16 flex justify-between items-center">
          {isFieldRoute ? (
            <div className="flex flex-col cursor-pointer" onClick={() => navigate('/fields')}>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg leading-tight">{currentField?.name || 'Shonali Desh'}</h1>
                <i className="fa-solid fa-chevron-down text-xs text-leaf-300"></i>
              </div>
              <p className="text-xs text-leaf-300 leading-tight">{currentField?.crop || 'ফসল নির্বাচন করুন'}</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/fields')}>
              <img src="/logo.png" alt="Shonali Desh Logo" className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors p-1 box-content" />
              <span className="font-bold text-lg tracking-wide">Shonali Desh Farmer</span>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button className="relative w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
              <i className="fa-solid fa-bell text-leaf-100 text-lg"></i>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-leaf-900"></span>
            </button>
            {!isFieldRoute && (
              <div onClick={() => navigate('/profile')} className="w-8 h-8 bg-leaf-700 rounded-full flex items-center justify-center text-xs font-bold border border-leaf-600 cursor-pointer hover:bg-leaf-600 transition-colors">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:ml-64 pb-24 lg:pb-8' : 'pb-8'
        } p-4 md:p-6 bg-gray-50`}>
        <div className={`mx-auto w-full ${showSidebar ? 'max-w-7xl' : 'max-w-7xl'}`}>
          {children}
        </div>
      </main>

      {/* Mobile/Tablet Bottom Nav (Only if Field Selected) */}
      {showSidebar && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-around items-center h-16 z-30 px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path.split('/').pop() || '');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isActive ? 'text-leaf-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-leaf-50 -translate-y-1' : ''}`}>
                  <i className={`fa-solid ${item.icon} text-lg mb-0.5`}></i>
                </div>
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;