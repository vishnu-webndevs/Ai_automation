import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div 
            layout
            className="bg-slate-900/60 p-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h4 className="font-semibold text-white text-base md:text-lg">{question}</h4>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-purple-400 shrink-0" />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="text-slate-400 text-sm mt-3 pt-3 border-t border-white/5 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PricingPage: React.FC = () => {
    const [annual, setAnnual] = useState(true);

    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.05
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 1, y: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] as const }
        }
    };

    const MotionLink = motion.create(Link);

    const faqs = [
        {
            question: "Can I switch plans later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle automatically."
        },
        {
            question: "Is there a free trial available?",
            answer: "Absolutely! The Starter plan is free forever, and the Pro plan comes with a 14-day free trial—no credit card required."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We support all major credit cards (Visa, MasterCard, American Express) as well as PayPal and invoicing for Enterprise plans."
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes, you can cancel your plan with one click from your account dashboard anytime with zero cancellation fees."
        }
    ];

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto overflow-hidden">
            {/* Header section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center mb-16"
            >
                <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-4"
                >
                    Flexible Billing Plans
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    Start for free, scale as you grow. No hidden fees or surprise charges.
                </p>
                
                {/* Toggle switch */}
                <div className="flex items-center justify-center gap-4 select-none">
                    <span className={`text-sm font-medium transition-colors ${!annual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                    <button 
                        onClick={() => setAnnual(!annual)}
                        className="w-14 h-8 bg-slate-800 rounded-full p-1 relative transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        aria-label="Toggle annual pricing"
                    >
                        <motion.div 
                            className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-md"
                            animate={{ x: annual ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-slate-400'}`}>
                        Annual <span className="text-purple-400 text-xs font-semibold ml-1 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">(Save 20%)</span>
                    </span>
                </div>
            </motion.div>

            {/* Pricing Cards Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
            >
                {[
                    { name: 'Starter', price: 0, desc: 'For individuals and hobbyists', features: ['Up to 10k requests/mo', 'Basic analytics', 'Community support', '1 Project'] },
                    { name: 'Pro', price: annual ? 49 : 59, desc: 'For growing teams', featured: true, features: ['Up to 1M requests/mo', 'Advanced analytics', 'Priority support', 'Unlimited Projects', 'Custom Rate Limiting'] },
                    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited requests', 'Dedicated infrastructure', '24/7 SLA support', 'SSO & Audit Logs', 'On-premise deployment'] }
                ].map((plan, idx) => (
                    <motion.div 
                        key={idx} 
                        variants={cardVariants}
                        whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border ${
                            plan.featured 
                                ? 'border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.2)] hover:shadow-[0_0_45px_rgba(168,85,247,0.3)]' 
                                : 'border-white/10 hover:border-white/20'
                        } flex flex-col transition-shadow duration-300`}
                    >
                        {plan.featured && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-purple-500/30"
                            >
                                Most Popular
                            </motion.div>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                        
                        {/* Price Display */}
                        <div className="mb-8 min-h-[52px] flex items-baseline">
                            {typeof plan.price === 'number' ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-white">$</span>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={plan.price}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                                        >
                                            {plan.price}
                                        </motion.span>
                                    </AnimatePresence>
                                    <span className="text-slate-400 font-medium">/mo</span>
                                </div>
                            ) : (
                                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                            )}
                        </div>

                        {/* Features List */}
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Link Button */}
                        <MotionLink 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            to={typeof plan.price === 'number' ? `/signup?plan=${encodeURIComponent(plan.name)}` : '/contact-us'}
                            className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-2 ${
                                plan.featured 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/5'
                            }`}
                        >
                            {typeof plan.price === 'number' ? 'Start Free Trial' : 'Contact Sales'}
                        </MotionLink>
                    </motion.div>
                ))}
            </motion.div>

            {/* Accordion FAQ Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-24"
            >
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10 tracking-tight">
                    Frequently Asked Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default PricingPage;

