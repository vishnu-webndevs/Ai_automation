import React from 'react';
import Button from '../ui/Button';

interface Template {
  id: number;
  name: string;
  slug: string;
  preview_image?: string;
  config_json?: any;
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template) => void;
  onPreview: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect, onPreview }) => {
  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-200 border-2 rounded-lg overflow-hidden ${
        isSelected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {template.preview_image ? (
          <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            No Preview
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onPreview(template);
            }}
          >
            Preview
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Select
          </Button>
        </div>
      </div>
      
      <div className="p-3 bg-white border-t border-slate-100">
        <h3 className="font-medium text-slate-900">{template.name}</h3>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
