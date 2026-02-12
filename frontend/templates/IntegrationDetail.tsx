import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { integrationService } from '../services/api';

const IntegrationDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: integration, isLoading, error } = useSWR(slug ? `integration-${slug}` : null, () => integrationService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading integration...</div>;
    if (error || !integration) return <div className="text-center py-20 text-white">Integration not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-slate-900/0 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-xl mb-8">
                        <span className="text-4xl">{integration.icon || '🔌'}</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {integration.name}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {integration.description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                 <div className="prose prose-invert prose-lg max-w-none">
                    <p>{integration.description}</p>
                 </div>
            </div>
        </div>
    );
};

export default IntegrationDetail;
