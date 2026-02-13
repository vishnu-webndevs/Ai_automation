import React from 'react';
import { Page } from '../../types';
import SectionRenderer from '../../components/SectionRenderer';

interface TemplateProps {
    page: Page;
}

const BlogClassicTemplate: React.FC<TemplateProps> = ({ page }) => {
    const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    return (
        <div className="blog-classic-template min-h-screen bg-white">
            {/* Sections */}
            <div>
                {sortedSections.map((section) => (
                    <SectionRenderer key={section.id} section={section} />
                ))}
            </div>
        </div>
    );
};

export default BlogClassicTemplate;
