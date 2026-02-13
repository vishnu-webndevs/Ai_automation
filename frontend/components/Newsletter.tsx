import React from 'react';

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
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
            <div className="bg-slate-800/50 rounded-2xl p-8 md:p-12 text-center border border-slate-700 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-purple-500/5 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">{subtitle}</p>
                    
                    <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="email" 
                            placeholder={placeholder} 
                            className="flex-1 bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors" 
                        />
                        <button 
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
                        >
                            {button_text}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
