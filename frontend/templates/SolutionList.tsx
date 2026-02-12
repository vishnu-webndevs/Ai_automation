import React from 'react';
import useSWR from 'swr';
import { solutionService } from '../services/api';
import { Link } from 'react-router-dom';

const SolutionList: React.FC = () => {
    const { data: solutions, isLoading } = useSWR('solutions', solutionService.getAll);

    if (isLoading) return <div className="text-center py-20 text-white">Loading solutions...</div>;

    return (
        <div className="bg-slate-900 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Our Solutions</h1>
                    <p className="text-xl text-slate-400">Tailored AI solutions for specific business needs</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions?.map((solution) => (
                        <Link 
                            to={`/solutions/${solution.slug}`} 
                            key={solution.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <span className="text-2xl">{solution.icon || '💡'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{solution.name}</h3>
                            <p className="text-slate-400 mb-4 line-clamp-3">{solution.description}</p>
                            <span className="text-blue-400 font-medium group-hover:text-blue-300 flex items-center">
                                Explore Solution 
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SolutionList;
