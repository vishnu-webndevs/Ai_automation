import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { TemplateCard } from './TemplateCard';
import Button from '../ui/Button';
import { listPageTemplates, applyPageTemplate } from '../../api';

interface Template {
  id: number;
  name: string;
  slug: string;
  preview_image?: string;
  config_json?: any;
}

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: number;
  onTemplateApplied: () => void;
}

// Simple Wireframe Component for Previews
const WireframePreview: React.FC<{ sections: any[] }> = ({ sections }) => {
    if (!sections || sections.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
                <span className="text-slate-400 font-medium">Empty Template</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm max-h-[60vh] overflow-y-auto">
            {[...sections].sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, idx) => {
                const type = section.type || section.section_key?.split('-')[0] || 'unknown';
                
                // Determine visual representation based on type
                let content;
                switch (type) {
                    case 'hero':
                        content = (
                            <div className="h-32 bg-indigo-50 rounded-md flex flex-col items-center justify-center gap-2 border border-indigo-100">
                                <div className="h-4 w-3/4 bg-indigo-200 rounded"></div>
                                <div className="h-3 w-1/2 bg-indigo-100 rounded"></div>
                                <div className="mt-2 h-6 w-24 bg-indigo-500 rounded-full opacity-50"></div>
                            </div>
                        );
                        break;
                    case 'features':
                        content = (
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-emerald-50 rounded-md border border-emerald-100 flex flex-col items-center justify-center gap-1">
                                        <div className="h-6 w-6 bg-emerald-200 rounded-full mb-1"></div>
                                        <div className="h-2 w-16 bg-emerald-100 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        );
                        break;
                    case 'text':
                        content = (
                            <div className="space-y-2 p-4 bg-slate-50 rounded-md border border-slate-100">
                                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                                <div className="h-2 w-full bg-slate-100 rounded"></div>
                                <div className="h-2 w-full bg-slate-100 rounded"></div>
                                <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                            </div>
                        );
                        break;
                    case 'pricing':
                         content = (
                            <div className="grid grid-cols-2 gap-4 px-8">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-32 bg-amber-50 rounded-md border border-amber-100 flex flex-col items-center p-2 gap-2">
                                        <div className="h-3 w-12 bg-amber-200 rounded"></div>
                                        <div className="h-6 w-16 bg-amber-300 rounded font-bold opacity-50"></div>
                                        <div className="w-full space-y-1 mt-2">
                                            <div className="h-1 w-full bg-amber-100"></div>
                                            <div className="h-1 w-full bg-amber-100"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                        break;
                    case 'newsletter':
                        content = (
                            <div className="h-24 bg-purple-50 rounded-md border border-purple-100 flex flex-col items-center justify-center gap-3">
                                <div className="h-4 w-1/2 bg-purple-200 rounded"></div>
                                <div className="flex gap-2 w-2/3">
                                    <div className="h-8 flex-1 bg-white border border-purple-100 rounded"></div>
                                    <div className="h-8 w-20 bg-purple-400 rounded opacity-50"></div>
                                </div>
                            </div>
                        );
                        break;
                    case 'blog':
                    case 'blog-grid':
                        content = (
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                                        <div className="w-12 h-12 bg-blue-200 rounded shrink-0"></div>
                                        <div className="flex-1 space-y-1">
                                            <div className="h-3 w-3/4 bg-blue-200 rounded"></div>
                                            <div className="h-2 w-full bg-blue-100 rounded"></div>
                                            <div className="h-2 w-1/2 bg-blue-100 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                        break;
                    default:
                        content = (
                            <div className="h-16 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">{type} Section</span>
                            </div>
                        );
                }

                return (
                    <div key={idx} className="relative group">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 z-10 border border-white shadow-sm">
                            {idx + 1}
                        </div>
                        <div className="pl-6">
                            {content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({ isOpen, onClose, pageId, onTemplateApplied }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await listPageTemplates();
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    const targetTemplate = previewTemplate || selectedTemplate;
    if (!targetTemplate) return;

    if (!confirm(`Applying the "${targetTemplate.name}" template will replace all existing sections. Continue?`)) {
        return;
    }

    setIsApplying(true);
    try {
      await applyPageTemplate(pageId, targetTemplate.id);
      onTemplateApplied();
      onClose();
      setPreviewTemplate(null);
    } catch (error) {
      console.error('Failed to apply template', error);
      alert('Failed to apply template. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
        <Modal
        isOpen={isOpen && !previewTemplate}
        onClose={onClose}
        title="Choose a Template"
        size="xl"
        footer={
            <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isApplying}>
                Cancel
            </Button>
            <Button 
                variant="primary" 
                onClick={handleApply} 
                disabled={!selectedTemplate || isApplying}
                isLoading={isApplying}
            >
                Apply Selected
            </Button>
            </div>
        }
        >
        {isLoading ? (
            <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
                <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={setSelectedTemplate}
                onPreview={setPreviewTemplate}
                />
            ))}
            </div>
        )}
        </Modal>

        {/* Preview Modal */}
        {previewTemplate && (
            <Modal
                isOpen={!!previewTemplate}
                onClose={() => setPreviewTemplate(null)}
                title={`Preview: ${previewTemplate.name}`}
                size="xl"
                footer={
                    <div className="flex justify-between w-full">
                        <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
                            Back to Library
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleApply}
                            isLoading={isApplying}
                        >
                            Use This Template
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-slate-700 mb-2">Template Structure</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            This template includes the following sections. The content is customizable after applying.
                        </p>
                        
                        <WireframePreview sections={previewTemplate.config_json?.sections || []} />
                    </div>
                    
                    {previewTemplate.preview_image && (
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Visual Preview</h3>
                            <img 
                                src={previewTemplate.preview_image} 
                                alt={previewTemplate.name} 
                                className="w-full rounded-lg border border-slate-200 shadow-sm"
                            />
                        </div>
                    )}
                </div>
            </Modal>
        )}
    </>
  );
};
