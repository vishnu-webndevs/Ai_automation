import React from 'react';
import { Page } from '../../types';
import SectionRenderer from '../../components/SectionRenderer';

interface TemplateProps {
    page: Page;
}

const LandingStartupTemplate: React.FC<TemplateProps> = ({ page }) => {
    const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    return (
        <div className="landing-startup-template min-h-screen bg-slate-900 text-white">
            <div className="relative">
                {/* Full width sections for landing page */}
                {sortedSections.map((section) => (
                    <SectionRenderer 
                        key={section.id} 
                        section={section} 
                        className={section.type === 'full-width' ? 'w-full' : 'container mx-auto px-4'}
                    />
                ))}
            </div>
            
            {/* Optional sticky footer CTA or something */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-24 pointer-events-none" />
        </div>
    );
};

export default LandingStartupTemplate;
