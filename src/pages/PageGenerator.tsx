import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPage, generatePageContent, getPage } from '../api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PageGenerator = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [existingPageId, setExistingPageId] = useState<number | null>(null);
    const [confirmOverwrite, setConfirmOverwrite] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        primary_keyword: '',
        target_industry: '',
        tone: 'Professional',
        content_length: 'Long',
        model: 'lorum',
        type: 'service',
        status: 'draft'
    });
    const [generatedData, setGeneratedData] = useState<any>(null);

    const publicBaseUrl = useMemo(() => {
        const url = (import.meta as any).env?.VITE_PUBLIC_SITE_URL;
        // Fix: Prevent preview links from opening on API domain
        if (url && url.includes('api.totan.ai')) {
            return 'https://totan.ai';
        }
        return url || 'https://totan.ai';
    }, []);

    useEffect(() => {
        const pageIdParam = searchParams.get('pageId');
        const overwriteParam = searchParams.get('confirmOverwrite');

        const pageId = pageIdParam ? Number(pageIdParam) : null;
        if (pageId && Number.isFinite(pageId)) {
            setExistingPageId(pageId);
            setConfirmOverwrite(overwriteParam === '1' || overwriteParam === 'true');
            getPage(pageId)
                .then((res) => {
                    const page = res.data;
                    setFormData((prev) => ({
                        ...prev,
                        title: page?.title || prev.title,
                        type: page?.type || prev.type,
                    }));
                })
                .catch(() => {});
        } else {
            setExistingPageId(null);
            setConfirmOverwrite(false);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            let pageId = existingPageId;
            if (!pageId) {
                const pageResponse = await createPage({
                    title: formData.title,
                    type: formData.type,
                    status: 'draft'
                });
                pageId = pageResponse.data.id;
            }

            const response = await generatePageContent({
                page_id: pageId,
                primary_keyword: formData.primary_keyword,
                target_industry: formData.target_industry,
                tone: formData.tone,
                content_length: formData.content_length,
                model: formData.model,
                confirm_overwrite: confirmOverwrite
            });

            setGeneratedData(response.data.data);
            alert('Content Generated Successfully!');
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Generation Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">AI Page Generator</h1>
            {existingPageId && (
                <div className="mb-4 text-sm text-gray-600">
                    Editing existing page ID: <span className="font-medium">{existingPageId}</span>
                    {generatedData?.slug && (
                        <>
                            {' '}•{' '}
                            <a className="text-blue-600 hover:underline" href={`${publicBaseUrl}/${generatedData.slug}`} target="_blank" rel="noreferrer">
                                Preview
                            </a>
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-bold text-gray-800">Page Configuration</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Page Title</label>
                                <Input 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. AI Customer Service" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Primary Keyword</label>
                                <Input 
                                    name="primary_keyword" 
                                    value={formData.primary_keyword} 
                                    onChange={handleChange} 
                                    placeholder="e.g. AI Call Center" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Target Industry</label>
                                <Input 
                                    name="target_industry" 
                                    value={formData.target_industry} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Healthcare" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tone</label>
                                    <select 
                                        name="tone" 
                                        value={formData.tone} 
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Technical">Technical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Length</label>
                                    <select 
                                        name="content_length" 
                                        value={formData.content_length} 
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="Short">Short (500 words)</option>
                                        <option value="Medium">Medium (1000 words)</option>
                                        <option value="Long">Long (2000 words)</option>
                                    </select>
                                </div>
                            </div>

                            {existingPageId && (
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={confirmOverwrite}
                                        onChange={(e) => setConfirmOverwrite(e.target.checked)}
                                    />
                                    Overwrite existing content
                                </label>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">AI Model</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            name="model" 
                                            value="lorum" 
                                            checked={formData.model === 'lorum'} 
                                            onChange={handleChange} 
                                        />
                                        Lorum Ipsum (Mock)
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            name="model" 
                                            value="openai" 
                                            checked={formData.model === 'openai'} 
                                            onChange={handleChange} 
                                        />
                                        OpenAI
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            name="model" 
                                            value="gemini" 
                                            checked={formData.model === 'gemini'} 
                                            onChange={handleChange} 
                                        />
                                        Gemini
                                    </label>
                                </div>
                            </div>

                            <Button 
                                onClick={handleGenerate} 
                                disabled={loading}
                                className="w-full mt-4"
                            >
                                {loading ? 'Generating...' : 'Generate SEO Content'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-bold text-gray-800">Generated Content Preview</h2>
                    </CardHeader>
                    <CardBody>
                        {generatedData ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                <div className="p-4 bg-gray-50 rounded">
                                    <h3 className="font-bold">Meta Data</h3>
                                    <p><strong>Title:</strong> {generatedData.title}</p>
                                    <p><strong>Meta Title:</strong> {generatedData.seo?.meta_title}</p>
                                    <p><strong>Meta Desc:</strong> {generatedData.seo?.meta_description}</p>
                                </div>

                                {generatedData.sections?.map((section: any, idx: number) => (
                                    <div key={idx} className="border-b pb-4">
                                        <h4 className="font-bold text-lg capitalize mb-2">{section.section_key}</h4>
                                        {section.blocks?.map((block: any, bIdx: number) => (
                                            <div key={bIdx} className="mb-2">
                                                <span className="text-xs text-gray-400 uppercase">{block.block_type}</span>
                                                <div className="mt-1">
                                                    {typeof block.content_json === 'string' 
                                                        ? block.content_json 
                                                        : JSON.stringify(block.content_json)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-gray-400">
                                No content generated yet.
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default PageGenerator;
