import React, { useState } from 'react';
import { Check } from 'lucide-react';

const PricingPage: React.FC = () => {
    const [annual, setAnnual] = useState(true);

    return (
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                    Start for free, scale as you grow. No hidden fees.
                </p>
                
                {/* Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm ${!annual ? 'text-white font-medium' : 'text-slate-400'}`}>Monthly</span>
                    <button 
                        onClick={() => setAnnual(!annual)}
                        className="w-14 h-8 bg-slate-800 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Toggle annual pricing"
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-purple-500 rounded-full transition-transform ${annual ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className={`text-sm ${annual ? 'text-white font-medium' : 'text-slate-400'}`}>
                        Annual <span className="text-purple-400 text-xs ml-1">(Save 20%)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: 'Starter', price: 0, desc: 'For individuals and hobbyists', features: ['Up to 10k requests/mo', 'Basic analytics', 'Community support', '1 Project'] },
                    { name: 'Pro', price: annual ? 49 : 59, desc: 'For growing teams', featured: true, features: ['Up to 1M requests/mo', 'Advanced analytics', 'Priority support', 'Unlimited Projects', 'Custom Rate Limiting'] },
                    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited requests', 'Dedicated infrastructure', '24/7 SLA support', 'SSO & Audit Logs', 'On-premise deployment'] }
                ].map((plan, idx) => (
                    <div key={idx} className={`relative bg-slate-900 rounded-2xl p-8 border ${plan.featured ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/10'} flex flex-col`}>
                        {plan.featured && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                        <div className="mb-8">
                            {typeof plan.price === 'number' ? (
                                <>
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-slate-400">/mo</span>
                                </>
                            ) : (
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                            )}
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <Check className="w-5 h-5 text-purple-500 shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                            plan.featured 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25' 
                                : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-white'
                        }`}>
                            {typeof plan.price === 'number' ? 'Start Free Trial' : 'Contact Sales'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20">
                <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
                            <h4 className="font-semibold text-white mb-2">Can I switch plans later?</h4>
                            <p className="text-slate-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
