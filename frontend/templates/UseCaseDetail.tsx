import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { useCaseService } from '../services/api';

const UseCaseDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: useCase, isLoading, error } = useSWR(slug ? `use-case-${slug}` : null, () => useCaseService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading use case...</div>;
    if (error || !useCase) return <div className="text-center py-20 text-white">Use Case not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen">
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-slate-900/0 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {useCase.name}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {useCase.description}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="prose prose-invert prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: useCase.content }} />
                </div>
            </div>
        </div>
    );
};

export default UseCaseDetail;
