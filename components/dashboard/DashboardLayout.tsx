import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';

const DashboardLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            case 'calendar':
                return <div className="ml-64 p-8 text-slate-500">Calendar View (Full) - Coming Soon</div>;
            case 'patients':
                return <div className="ml-64 p-8 text-slate-500">Patient Records - Coming Soon</div>;
            case 'messages':
                return <div className="ml-64 p-8 text-slate-500">Messages - Coming Soon</div>;
            case 'settings':
                return <div className="ml-64 p-8 text-slate-500">Settings - Coming Soon</div>;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderContent()}
        </div>
    );
};

export default DashboardLayout;
