import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { industryService } from '../services/api';

const IndustryDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: industry, isLoading, error } = useSWR(slug ? `industry-${slug}` : null, () => industryService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading industry...</div>;
    if (error || !industry) return <div className="text-center py-20 text-white">Industry not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen">
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900/0 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-8">
                        <span className="text-4xl">{industry.icon || '🏭'}</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {industry.name}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {industry.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IndustryDetail;
