import React from 'react';
import { Page } from '../../types';
import SectionRenderer from '../../components/SectionRenderer';

interface TemplateProps {
    page: Page;
}

const TotanPreviewTemplate: React.FC<TemplateProps> = ({ page }) => {
    const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="relative">
                {sortedSections.map((section) => (
                    <SectionRenderer
                        key={section.id}
                        section={section}
                        className={section.type === 'full-width' ? 'w-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'}
                    />
                ))}
            </div>
        </div>
    );
};

export default TotanPreviewTemplate;

