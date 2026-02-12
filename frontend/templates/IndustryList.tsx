import React from 'react';
import useSWR from 'swr';
import { industryService } from '../services/api';
import { Link } from 'react-router-dom';

const IndustryList: React.FC = () => {
    const { data: industries, isLoading } = useSWR('industries', industryService.getAll);

    if (isLoading) return <div className="text-center py-20 text-white">Loading industries...</div>;

    return (
        <div className="bg-slate-900 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Industries We Serve</h1>
                    <p className="text-xl text-slate-400">Tailored AI solutions for your specific sector</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {industries?.map((industry) => (
                        <Link 
                            to={`/industries/${industry.slug}`} 
                            key={industry.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <span className="text-2xl">{industry.icon || '🏭'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{industry.name}</h3>
                            <p className="text-slate-400 mb-4 line-clamp-3">{industry.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IndustryList;
