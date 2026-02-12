import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PricingPlan {
  name: string;
  price: number | string;
  desc: string;
  features: string[];
  featured?: boolean;
  cta_text?: string;
  cta_url?: string;
}

export interface PricingProps {
  heading?: string;
  subheading?: string;
  plans?: PricingPlan[];
}

const Pricing: React.FC<PricingProps> = ({
  heading = "Flexible plans and features",
  subheading = "All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary.",
  plans = [
    { 
        name: 'Pro', 
        price: 24, 
        desc: 'Everything at your fingertips.', 
        features: ['100 Placeholder text', '4 Placeholder text', 'Unlimited', '1 Placeholder'],
        featured: false,
        cta_text: 'Get Started',
        cta_url: '/signup'
    },
    { 
        name: 'Team', 
        price: 49, 
        desc: 'Everything at your fingertips.', 
        features: ['Unlimited Placeholder', 'Unlimited Placeholder', 'Unlimited', '5 Placeholder', 'Early Access'],
        featured: true,
        cta_text: 'Get Started',
        cta_url: '/signup'
    },
    { 
        name: 'Enterprise', 
        price: 79, 
        desc: 'Everything at your fingertips.', 
        features: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited', '24/7 Support'],
        featured: false,
        cta_text: 'Get Started',
        cta_url: '/contact'
    }
  ]
}) => {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-12">
          <div className="text-purple-400 font-medium mb-2">Pricing plans</div>
          <h2 className="text-4xl font-bold text-white mb-6">{heading}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">{subheading}</p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full bg-slate-700 relative transition-colors duration-300 focus:outline-none"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-purple-500 transition-all duration-300 ${annual ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-slate-500'}`}>Yearly <span className="text-purple-400 text-xs">(-20%)</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-slate-900/50 border ${plan.featured ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-slate-800'} rounded-3xl p-8 flex flex-col text-left relative overflow-hidden`}>
                {plan.featured && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                )}
               <div className="mb-4">
                  <div className={`${plan.featured ? 'text-purple-400' : 'text-slate-400'} font-medium mb-1`}>{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                     {typeof plan.price === 'number' && <span className="text-3xl font-bold text-white">$</span>}
                     <span className="text-4xl font-bold text-white">
                        {typeof plan.price === 'number' ? (annual ? plan.price : (plan.price as number * 1.2).toFixed(0)) : plan.price}
                     </span>
                     {typeof plan.price === 'number' && <span className="text-slate-500">/mo</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{plan.desc}</div>
               </div>
               <Link to={plan.cta_url || '#'} className={`w-full py-2 rounded-full border ${plan.featured ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 border-transparent shadow-lg' : 'border-slate-700 text-white hover:bg-slate-800'} transition-all mb-6 text-sm flex items-center justify-center`}>
                  {plan.cta_text || 'Get Started'} {plan.featured ? '→' : ''}
               </Link>
               <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                     <li key={i} className={`flex items-center gap-3 text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-400'}`}>
                        <Check size={14} className="text-purple-400" /> {f}
                     </li>
                  ))}
               </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;