import React from 'react';
import DashboardHome from './DashboardHome';

const DashboardLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex flex-col">
            <DashboardHome />
        </div>
    );
};

export default DashboardLayout;
