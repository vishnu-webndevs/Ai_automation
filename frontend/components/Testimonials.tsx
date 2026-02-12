import React from 'react';

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  image?: string;
}

export interface TestimonialsProps {
  items?: TestimonialItem[];
}

const Testimonials: React.FC<TestimonialsProps> = ({
  items = [
    {
        quote: "As a busy professional, I don't have a lot of time to devote to working out. But with this fitness program, I have seen amazing results in just a few short weeks. The workouts are efficient and effective.",
        author: "Jeff Kahl",
        role: "Appy Product Lead",
        image: "https://picsum.photos/100/100"
    }
  ]
}) => {
  return (
    <section className="py-20 border-t border-slate-800/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`grid gap-12 ${items.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'place-items-center'}`}>
            {items.map((item, idx) => (
                <div key={idx} className={`${items.length === 1 ? 'max-w-4xl text-center' : 'bg-slate-900/30 p-8 rounded-2xl border border-slate-800/50'}`}>
                    {item.image && (
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] mb-6 ${items.length === 1 ? 'mx-auto' : ''}`}>
                            <img 
                            src={item.image} 
                            alt={item.author} 
                            className="rounded-full w-full h-full object-cover border-2 border-slate-900"
                            />
                        </div>
                    )}
                    <blockquote className={`${items.length === 1 ? 'text-xl md:text-2xl' : 'text-lg'} font-medium text-slate-300 mb-6 leading-relaxed`}>
                    "{item.quote}"
                    </blockquote>
                    <div className={`flex items-center gap-2 text-sm ${items.length === 1 ? 'justify-center' : ''}`}>
                    <span className="text-white font-semibold">{item.author}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-purple-400">{item.role}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;