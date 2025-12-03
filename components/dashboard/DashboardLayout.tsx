import React, { useState } from 'react';
import DashboardHome from './DashboardHome';
import Sidebar from './Sidebar';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { signOut } = useUser();
    const navigate = useNavigate();

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 ml-64">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardLayout;
