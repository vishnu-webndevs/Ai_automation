import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPage, updatePage } from '../api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Layout } from 'lucide-react';
import ImagePicker from '../components/media/ImagePicker';

// Default content generators for blocks
const getDefaultContent = (type: string) => {
    switch (type) {
        case 'hero':
            return {
                heading: 'Welcome to Your Site',
                subheading: 'This is a hero section. Customize it with your own text.',
                badge: 'New Feature'
            };
        case 'features':
            return {
                heading: 'Our Features',
                subheading: 'Discover what we can do for you.',
                features: [
                    { title: 'Feature 1', description: 'Description for feature 1', icon: 'Zap' },
                    { title: 'Feature 2', description: 'Description for feature 2', icon: 'Shield' },
                    { title: 'Feature 3', description: 'Description for feature 3', icon: 'Smile' }
                ]
            };
        case 'text':
            return {
                html: '<div class="text-slate-300"><h2 class="text-3xl font-bold text-white mb-4">Rich Text Section</h2><p class="mb-4">Write your custom HTML content here. This text is styled with Tailwind classes for dark mode.</p><ul class="list-disc pl-5 space-y-2"><li>Dark background compatible</li><li>Tailwind CSS support</li><li>Fully customizable</li></ul></div>'
            };
        case 'pricing':
            return {
                title: 'Simple Pricing',
                subtitle: 'Choose the plan that fits your needs.',
                plans: [
                    { name: 'Basic', price: '$9', features: ['Feature A', 'Feature B'] },
                    { name: 'Pro', price: '$29', features: ['All Basic', 'Feature C'] }
                ]
            };
        case 'newsletter':
            return {
                title: 'Stay Updated',
                subtitle: 'Subscribe to our newsletter.',
                button_text: 'Subscribe'
            };
        case 'blog-grid':
            return {
                columns: 3,
                show_categories: true
            };
        default:
            return {};
    }
};

const AVAILABLE_BLOCKS = [
    { type: 'hero', label: 'Hero Section', icon: 'Layout' },
    { type: 'features', label: 'Features Grid', icon: 'Grid' },
    { type: 'text', label: 'Rich Text', icon: 'Type' },
    { type: 'pricing', label: 'Pricing Table', icon: 'DollarSign' },
    { type: 'newsletter', label: 'Newsletter', icon: 'Mail' },
    { type: 'blog-grid', label: 'Blog Grid', icon: 'FileText' },
    { type: 'testimonials', label: 'Testimonials', icon: 'MessageSquare' },
];

const PageEditor = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pageId = searchParams.get('pageId');
    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (pageId) {
            loadPage(Number(pageId));
        }
    }, [pageId]);

    const loadPage = async (id: number) => {
        setLoading(true);
        try {
            const res = await getPage(id);
            setPageData(res.data);
            const sortedSections = (res.data.sections || []).sort((a: any, b: any) => a.order - b.order);
            const sectionsWithSortedBlocks = sortedSections.map((s: any) => ({
                ...s,
                blocks: (s.blocks || []).sort((a: any, b: any) => a.order - b.order)
            }));
            setSections(sectionsWithSortedBlocks);
        } catch (error) {
            console.error('Failed to load page', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!pageId) return;
        setLoading(true);
        try {
            const payload = {
                sections: sections.map((s, index) => ({
                    id: s.id?.toString().startsWith('temp') ? null : s.id,
                    section_key: s.section_key || `section-${Date.now()}-${index}`,
                    order: index,
                    blocks: s.blocks.map((b: any, bIndex: number) => ({
                        id: b.id?.toString().startsWith('temp') ? null : b.id,
                        block_type: b.block_type,
                        content_json: b.content_json,
                        order: bIndex
                    }))
                }))
            };

            await updatePage(Number(pageId), payload);
            // Reload to get real IDs back
            await loadPage(Number(pageId));
            alert('Page updated successfully!');
        } catch (error) {
            console.error('Failed to save page', error);
            alert('Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    const addSection = (blockType: string) => {
        const newSection = {
            id: `temp-section-${Date.now()}`,
            section_key: `section-${Date.now()}`,
            order: sections.length,
            blocks: [{
                id: `temp-block-${Date.now()}`,
                block_type: blockType,
                content_json: getDefaultContent(blockType),
                order: 0
            }]
        };
        setSections([...sections, newSection]);
        setShowAddModal(false);
    };

    const removeSection = (index: number) => {
        if (confirm('Are you sure you want to remove this section?')) {
            const newSections = [...sections];
            newSections.splice(index, 1);
            setSections(newSections);
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        
        setSections(newSections);
    };

    const updateBlockContent = (sectionIndex: number, blockIndex: number, field: string, value: any) => {
        const newSections = [...sections];
        const block = newSections[sectionIndex].blocks[blockIndex];
        
        if (!block.content_json) block.content_json = {};
        
        block.content_json = {
            ...block.content_json,
            [field]: value
        };
        
        setSections(newSections);
    };

    if (loading && !pageData) return <div className="p-8 text-center">Loading editor...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto pb-32">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur shadow-sm border-b border-gray-200 -mx-6 px-6 py-4 mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout className="w-6 h-6 text-purple-600" />
                        {pageData?.title}
                    </h1>
                    <p className="text-gray-500 text-sm">Builder Mode • {sections.length} Sections</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" outline onClick={() => navigate('/web-admin/pages')}>Back</Button>
                    <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Save size={16} /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {sections.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-gray-500 mb-4">Start building your page by adding a section</p>
                        <Button onClick={() => setShowAddModal(true)}>+ Add First Section</Button>
                    </div>
                )}

                {sections.map((section, sIndex) => (
                    <Card key={section.id || sIndex} className="border border-gray-200 group hover:border-purple-200 transition-colors">
                        <CardHeader className="bg-gray-50 flex items-center justify-between py-2 px-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-200 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                                    {sIndex + 1}
                                </span>
                                <span className="font-semibold text-gray-700 uppercase text-xs tracking-wider">
                                    {section.blocks?.[0]?.block_type || 'Section'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => moveSection(sIndex, 'up')}
                                    disabled={sIndex === 0}
                                    className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-purple-600 disabled:opacity-30"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button 
                                    onClick={() => moveSection(sIndex, 'down')}
                                    disabled={sIndex === sections.length - 1}
                                    className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-purple-600 disabled:opacity-30"
                                >
                                    <ArrowDown size={16} />
                                </button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <button 
                                    onClick={() => removeSection(sIndex)}
                                    className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody className="p-4 bg-white">
                            {section.blocks?.map((block: any, bIndex: number) => (
                                <div key={block.id || bIndex} className="space-y-4">
                                    {/* Dynamic Fields based on Block Type */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {(block.block_type === 'hero' || block.block_type === 'hero_simple' || block.block_type === 'hero_split') && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Layout</label>
                                                        <select
                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                                            value={block.content_json?.layout || 'center'}
                                                            onChange={(e) => updateBlockContent(sIndex, bIndex, 'layout', e.target.value)}
                                                        >
                                                            <option value="center">Center (Default)</option>
                                                            <option value="left">Image Left</option>
                                                            <option value="right">Image Right</option>
                                                            <option value="top">Image Top</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <ImagePicker 
                                                            label="Custom Image"
                                                            value={block.content_json?.image || ''} 
                                                            onChange={(val) => updateBlockContent(sIndex, bIndex, 'image', val)}
                                                            placeholder="Image URL (optional)"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Heading</label>
                                                    <Input 
                                                        value={block.content_json?.heading || block.content_json?.title || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'heading', e.target.value)}
                                                        placeholder="Enter main heading..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subheading</label>
                                                    <textarea 
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                        value={block.content_json?.subheading || block.content_json?.subtitle || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'subheading', e.target.value)}
                                                        rows={2}
                                                        placeholder="Enter subheading text..."
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {(block.block_type === 'features' || block.block_type === 'features_grid') && (
                                            <>
                                                <div className="mb-4">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Layout</label>
                                                    <select
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                                        value={block.content_json?.layout || 'left'}
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'layout', e.target.value)}
                                                    >
                                                        <option value="left">Text Left, Image Right (Default)</option>
                                                        <option value="right">Image Left, Text Right</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Heading</label>
                                                    <Input 
                                                        value={block.content_json?.heading || block.content_json?.title || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'heading', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subheading</label>
                                                    <Input 
                                                        value={block.content_json?.subheading || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'subheading', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-3 mt-2">
                                                    <label className="block text-xs font-medium text-gray-500">Features List</label>
                                                    {(block.content_json?.features || []).map((feature: any, fIndex: number) => (
                                                        <div key={fIndex} className="p-3 bg-gray-50 rounded border border-gray-200 flex gap-2">
                                                            <div className="flex-1 space-y-2">
                                                                <Input 
                                                                    value={feature.title || ''}
                                                                    onChange={(e) => {
                                                                        const newFeatures = [...(block.content_json?.features || [])];
                                                                        newFeatures[fIndex] = { ...feature, title: e.target.value };
                                                                        updateBlockContent(sIndex, bIndex, 'features', newFeatures);
                                                                    }}
                                                                    placeholder="Feature Title"
                                                                />
                                                                <Input 
                                                                    value={feature.description || ''}
                                                                    onChange={(e) => {
                                                                        const newFeatures = [...(block.content_json?.features || [])];
                                                                        newFeatures[fIndex] = { ...feature, description: e.target.value };
                                                                        updateBlockContent(sIndex, bIndex, 'features', newFeatures);
                                                                    }}
                                                                    placeholder="Description"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const newFeatures = [...(block.content_json?.features || [])];
                                                                    newFeatures.splice(fIndex, 1);
                                                                    updateBlockContent(sIndex, bIndex, 'features', newFeatures);
                                                                }}
                                                                className="text-red-500 hover:text-red-700 self-center"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        onClick={() => {
                                                            const newFeatures = [...(block.content_json?.features || []), { title: 'New Feature', description: '', icon: 'Zap' }];
                                                            updateBlockContent(sIndex, bIndex, 'features', newFeatures);
                                                        }}
                                                    >
                                                        Add Feature
                                                    </Button>
                                                </div>
                                             </>
                                         )}

                                         {block.block_type === 'pricing' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                    <Input 
                                                        value={block.content_json?.title || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                                                    <Input 
                                                        value={block.content_json?.subtitle || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'subtitle', e.target.value)}
                                                    />
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                                                    Pricing plans can be edited in the JSON view below.
                                                </div>
                                            </>
                                         )}
 
                                         {block.block_type === 'text' && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Content (HTML allowed)</label>
                                                <textarea 
                                                    className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono h-48 focus:ring-2 focus:ring-purple-500 outline-none"
                                                    value={block.content_json?.html || ''}
                                                    onChange={(e) => updateBlockContent(sIndex, bIndex, 'html', e.target.value)}
                                                    placeholder="<p>Enter your content here...</p>"
                                                />
                                            </div>
                                        )}
                                        
                                        {block.block_type === 'newsletter' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                    <Input 
                                                        value={block.content_json?.title || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                                                    <Input 
                                                        value={block.content_json?.button_text || ''} 
                                                        onChange={(e) => updateBlockContent(sIndex, bIndex, 'button_text', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        
                                        {block.block_type === 'blog-grid' && (
                                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                                                This block automatically displays your latest blog posts.
                                            </div>
                                        )}

                                        {/* JSON Fallback */}
                                        <div className="mt-2">
                                            <details className="text-xs text-gray-400">
                                                <summary className="cursor-pointer hover:text-gray-600">Advanced: Edit Raw JSON</summary>
                                                <textarea 
                                                    className="w-full border rounded p-2 text-xs font-mono h-32 mt-2 bg-gray-50"
                                                    value={JSON.stringify(block.content_json, null, 2)}
                                                    onChange={(e) => {
                                                        try {
                                                            const json = JSON.parse(e.target.value);
                                                            const newSections = [...sections];
                                                            newSections[sIndex].blocks[bIndex].content_json = json;
                                                            setSections(newSections);
                                                        } catch (err) { /* ignore */ }
                                                    }}
                                                />
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                ))}

                <div className="flex justify-center pt-4">
                    <Button onClick={() => setShowAddModal(true)} className="px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <Plus className="w-5 h-5 mr-2" /> Add New Section
                    </Button>
                </div>
            </div>

            {/* Add Section Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Select a Block</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                            {AVAILABLE_BLOCKS.map(block => (
                                <button 
                                    key={block.type}
                                    onClick={() => addSection(block.type)}
                                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 group-hover:text-purple-600">
                                        <Plus size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">{block.label}</span>
                                    <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{block.type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageEditor;
