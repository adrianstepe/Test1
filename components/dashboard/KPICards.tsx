import React from 'react';
import { CalendarCheck, Users, Clock, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

const KPICards: React.FC = () => {
    const stats = [
        {
            label: 'Appointments Today',
            value: '12',
            change: '+2',
            trend: 'up',
            icon: CalendarCheck,
            color: 'bg-blue-500',
        },
        {
            label: 'Patients Waiting',
            value: '3',
            change: 'On time',
            trend: 'neutral',
            icon: Users,
            color: 'bg-teal-500',
        },
        {
            label: 'Pending Requests',
            value: '5',
            change: '-1',
            trend: 'down',
            icon: Clock,
            color: 'bg-amber-500',
        },
        {
            label: 'Revenue (Est.)',
            value: '€1,250',
            change: '+15%',
            trend: 'up',
            icon: CreditCard,
            color: 'bg-indigo-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                <Icon size={20} className={`text-${stat.color.replace('bg-', '')}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {stat.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                            {stat.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                            <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' :
                                    stat.trend === 'down' ? 'text-red-600' : 'text-slate-400'
                                }`}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-slate-400">vs yesterday</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;
