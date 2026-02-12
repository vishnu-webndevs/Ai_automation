import React from 'react';
import useSWR from 'swr';
import { solutionService, integrationService } from '../services/api';
import { Link } from 'react-router-dom';

const PlatformList: React.FC = () => {
    const { data: solutions, isLoading: loadingSolutions } = useSWR('solutions', solutionService.getAll);
    const { data: integrations, isLoading: loadingIntegrations } = useSWR('integrations', integrationService.getAll);

    const isLoading = loadingSolutions || loadingIntegrations;

    if (isLoading) return <div className="text-center py-20 text-white">Loading platform ecosystem...</div>;

    return (
        <div className="bg-slate-900 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Platform Ecosystem</h1>
                    <p className="text-xl text-slate-400">Discover our powerful solutions and seamless integrations</p>
                </div>
                
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Solutions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {solutions?.map((solution) => (
                            <Link to={`/solutions/${solution.slug}`} key={solution.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors group">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                    <span className="text-2xl">{solution.icon || '💡'}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{solution.name}</h3>
                                <p className="text-slate-400 mb-4 line-clamp-3">{solution.description}</p>
                                <span className="text-blue-400 font-medium group-hover:text-blue-300 flex items-center">
                                    Learn More 
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Integrations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {integrations?.map((integration) => (
                            <Link to={`/integrations/${integration.slug}`} key={integration.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors group">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                    <span className="text-2xl">{integration.icon || '🔌'}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{integration.name}</h3>
                                <p className="text-slate-400 mb-4 line-clamp-3">{integration.description}</p>
                                <span className="text-purple-400 font-medium group-hover:text-purple-300 flex items-center">
                                    Connect 
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformList;
