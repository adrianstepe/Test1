import React from 'react';
import { LayoutDashboard, Calendar, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { signOut } = useUser();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Panelis', icon: LayoutDashboard },
        { id: 'calendar', label: 'Kalendārs', icon: Calendar },
        { id: 'patients', label: 'Pacientu kartes', icon: Users },
        { id: 'messages', label: 'Ziņojumi', icon: MessageSquare },
        { id: 'settings', label: 'Iestatījumi', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <span className="font-bold text-xl text-slate-800">Butkeviča</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-11">Zobārstniecības prakse</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (item.id === 'dashboard') navigate('/dashboard');
                                else if (item.id === 'calendar') navigate('/dashboard/calendar');
                                // Add other routes as they are implemented
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-teal-50 text-teal-700 shadow-sm'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    Iziet
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
