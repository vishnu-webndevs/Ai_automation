import React from 'react';
import useSWR from 'swr';
import { serviceService } from '../services/api';
import { Link } from 'react-router-dom';

const ServiceList: React.FC = () => {
    const { data: services, isLoading } = useSWR('services', serviceService.getAll);

    if (isLoading) return <div className="text-center py-20 text-white">Loading services...</div>;

    return (
        <div className="bg-slate-900 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
                    <p className="text-xl text-slate-400">Comprehensive AI solutions for your business</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services?.map((service) => (
                        <Link 
                            to={`/services/${service.slug}`} 
                            key={service.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <span className="text-2xl">{service.icon || '🚀'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{service.name}</h3>
                            <p className="text-slate-400 mb-4 line-clamp-3">{service.short_description}</p>
                            <span className="text-purple-400 font-medium group-hover:text-purple-300 flex items-center">
                                Learn more 
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceList;
