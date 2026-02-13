import React from 'react';
import { PageSection } from '../types';
import BlockRenderer from './BlockRenderer';

interface SectionRendererProps {
    section: PageSection;
    className?: string;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, className = '' }) => {
    // Determine section styling based on type or custom props
    const baseClass = section.type === 'full-width' 
        ? 'w-full relative' 
        : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative';

    // Merge custom className
    const finalClass = `${baseClass} ${className}`;

    return (
        <section className={finalClass} id={`section-${section.id}`}>
            {/* Render Blocks within Section */}
            {section.blocks?.sort((a, b) => a.order - b.order).map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </section>
    );
};

export default SectionRenderer;
