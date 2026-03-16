import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Blog, BlogCategory } from '../types';
import Modal from '../components/ui/Modal';

const BlogManager = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [aiModel, setAiModel] = useState<'lorum' | 'openai' | 'gemini'>('openai');
    const [aiTone, setAiTone] = useState('Professional');
    const [aiContentLength, setAiContentLength] = useState<'Short' | 'Medium' | 'Long'>('Long');
    const [confirmOverwriteAi, setConfirmOverwriteAi] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [blogsRes, catsRes] = await Promise.all([
                api.get('/blogs'),
                api.get('/blog-categories')
            ]);
            setBlogs(blogsRes.data.data || []);

            const catsPayload = catsRes.data;
            const catsData = Array.isArray(catsPayload)
                ? catsPayload
                : catsPayload.data || [];

            setCategories(catsData);
        } catch (error) {
            console.error('Failed to fetch blogs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const buildPayload = (blog: Partial<Blog>) => {
        const payload: any = {
            title: blog.title,
            slug: blog.slug,
            status: blog.status,
            type: 'blog',
        };

        if (blog.category_id) {
            payload.blog_categories = [blog.category_id];
        }

        return payload;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentBlog.id) {
                await api.put(`/blogs/${currentBlog.id}`, buildPayload(currentBlog));
            } else {
                await api.post('/blogs', buildPayload(currentBlog));
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save blog', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            try {
                await api.delete(`/blogs/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete blog', error);
            }
        }
    };

    const handleGenerate = async () => {
        if (!currentBlog.title) {
            alert('Please enter a title first');
            return;
        }
        setGeneratingAi(true);
        try {
            let pageId = (currentBlog as any).id as number | undefined;
            if (!pageId) {
                const res = await api.post('/blogs', buildPayload({ ...currentBlog, status: currentBlog.status || 'draft' }));
                pageId = res.data?.id;
                if (pageId) {
                    setCurrentBlog(res.data);
                }
            }

            if (!pageId) {
                alert('Failed to create blog post first.');
                return;
            }

            const selectedCategoryName = categories.find((c) => c.id === (currentBlog as any).category_id)?.name;
            const pageStructure =
                'Write a long-form blog article. Use these block types only: heading, paragraph, list. Use multiple headings and paragraphs. For list blocks, content must be an array of strings. End with a short FAQ section (faqs array) and internal_links relevant to Totan.ai. Avoid hero blocks and avoid button blocks except optional final CTA.';

            await api.post('/ai/generate-page', {
                page_id: pageId,
                primary_keyword: currentBlog.title,
                target_industry: selectedCategoryName || 'General',
                tone: aiTone,
                content_length: aiContentLength,
                model: aiModel,
                preserve_title: true,
                page_structure: pageStructure,
                confirm_overwrite: confirmOverwriteAi,
            });

            await fetchData();
            alert('AI content generated and saved.');
            navigate(`/web-admin/pages/editor?pageId=${pageId}`);
        } catch (e: any) {
            const code = e?.response?.data?.code;
            if (e?.response?.status === 409 && code === 'CONFIRM_OVERWRITE_REQUIRED') {
                setConfirmOverwriteAi(true);
                alert('This blog already has content. Enable overwrite and run again.');
            } else {
                alert(e?.response?.data?.message || 'AI generation failed');
            }
        } finally {
            setGeneratingAi(false);
        }
    };

    const canGenerate = useMemo(() => {
        return !!currentBlog.title && !generatingAi;
    }, [currentBlog.title, generatingAi]);

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || 
            blog.category_id?.toString() === filterCategory ||
            blog.blog_categories?.some(c => c.id.toString() === filterCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
                    <p className="text-gray-500">Manage and publish blog content</p>
                </div>
                <button 
                    onClick={() => { setCurrentBlog({ status: 'draft', is_featured: false }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Create Post</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search posts..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading blogs...</td>
                                </tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No blog posts found.</td>
                                </tr>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{blog.title}</div>
                                            <div className="text-xs text-gray-500">{blog.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                {blog.blog_categories && blog.blog_categories.length > 0 
                                                    ? blog.blog_categories.map(c => c.name).join(', ') 
                                                    : (categories.find(c => c.id === blog.category_id)?.name || 'Uncategorized')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                blog.status === 'published' ? 'bg-green-100 text-green-800' :
                                                blog.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setCurrentBlog(blog); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentBlog.id ? 'Edit Post' : 'Create New Post'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentBlog.title || ''}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                                    title="Generate with AI"
                                >
                                    <Sparkles size={18} />
                                    <span className="hidden sm:inline">{generatingAi ? 'Generating...' : 'Generate'}</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={currentBlog.slug || ''}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                                placeholder="Auto-generated if empty"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={currentBlog.category_id || ''}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, category_id: Number(e.target.value) })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={currentBlog.status || 'draft'}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, status: e.target.value as any })}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>

                        {currentBlog.status === 'scheduled' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentBlog.published_at ? currentBlog.published_at.slice(0, 16) : ''}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, published_at: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">AI generation settings</div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiModel}
                                        onChange={(e) => setAiModel(e.target.value as any)}
                                    >
                                        <option value="openai">OpenAI</option>
                                        <option value="gemini">Gemini</option>
                                        <option value="lorum">Lorum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiTone}
                                        onChange={(e) => setAiTone(e.target.value)}
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Technical">Technical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiContentLength}
                                        onChange={(e) => setAiContentLength(e.target.value as any)}
                                    >
                                        <option value="Short">Short</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Long">Long</option>
                                    </select>
                                </div>
                            </div>
                            <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={confirmOverwriteAi}
                                    onChange={(e) => setConfirmOverwriteAi(e.target.checked)}
                                />
                                Overwrite existing blog content
                            </label>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_featured"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={currentBlog.is_featured || false}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, is_featured: e.target.checked })}
                            />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Featured Post</label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {currentBlog.id ? 'Save Changes' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BlogManager;
