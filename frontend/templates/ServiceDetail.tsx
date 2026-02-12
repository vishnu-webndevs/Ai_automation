import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { serviceService } from '../services/api';

const ServiceDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: service, isLoading, error } = useSWR(slug ? `service-${slug}` : null, () => serviceService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading service...</div>;
    if (error || !service) return <div className="text-center py-20 text-white">Service not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-900/0 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-xl mb-8">
                        <span className="text-4xl">{service.icon || '🚀'}</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {service.name}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {service.short_description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="prose prose-invert prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: service.full_description }} />
                </div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-white mb-8">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {service.features.map((feature: any, idx: number) => (
                                <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title || feature.name}</h3>
                                    <p className="text-slate-400 text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDetail;
