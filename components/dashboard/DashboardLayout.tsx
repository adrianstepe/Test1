import React, { useState } from 'react';
import DashboardHome from './DashboardHome';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { signOut } = useUser();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative">
            {renderContent()}

            <button
                onClick={handleSignOut}
                className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-50 border border-gray-100 transition-all z-50"
            >
                <LogOut size={18} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    );
};

export default DashboardLayout;
