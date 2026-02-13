import React from 'react';
import { Page, PageSection } from '../../types';
import SectionRenderer from '../../components/SectionRenderer';

const BlankCanvas: React.FC<{ page: Page }> = ({ page }) => {
    // Sort sections by order
    const sortedSections = [...(page.sections || [])].sort((a: PageSection, b: PageSection) => (a.order || 0) - (b.order || 0));

    return (
        <div className="min-h-screen bg-slate-900">
            {sortedSections.map((section) => (
                <SectionRenderer 
                    key={section.id} 
                    section={section} 
                    className="py-12"
                />
            ))}
            
            {sortedSections.length === 0 && (
                <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Empty Canvas</h2>
                        <p>Add sections via the Admin Page Builder to start designing.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlankCanvas;
