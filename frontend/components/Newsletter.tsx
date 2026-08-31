import React, { useState } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterProps {
    title?: string;
    subtitle?: string;
    button_text?: string;
    placeholder?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({ 
    title = 'Subscribe to our newsletter', 
    subtitle = 'Stay updated with our latest news', 
    button_text = 'Subscribe',
    placeholder = 'Enter your email'
}) => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSent(false);
        setSubmitting(true);
        try {
            await api.post('/contact', {
                email,
                source: 'newsletter',
                source_url: typeof window !== 'undefined' ? window.location.href : undefined,
            });
            setSent(true);
            setEmail('');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to subscribe.';
            setError(String(message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center border border-slate-700 relative overflow-hidden shadow-2xl"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-purple-500/10 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{title}</h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">{subtitle}</p>
                    
                    <AnimatePresence mode="wait">
                        {sent && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-base text-emerald-100"
                            >
                                Subscribed successfully!
                            </motion.div>
                        )}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-base text-red-100"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={submit}>
                        <input 
                            type="email" 
                            placeholder={placeholder} 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors shadow-inner" 
                        />
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting || email.trim().length === 0}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors font-medium whitespace-nowrap disabled:opacity-50 shadow-md cursor-pointer"
                        >
                            {submitting ? 'Submitting...' : button_text}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Newsletter;

