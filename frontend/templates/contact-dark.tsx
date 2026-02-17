import React from 'react';
import { Page } from '../types';

interface TemplateProps {
    page: Page;
}

const ContactDark: React.FC<TemplateProps> = ({ page }) => {
    const sections = page.sections || [];

    const findBlockByType = (type: string) => {
        for (const section of sections) {
            const blocks = section.blocks || [];
            const match = blocks.find((b: any) => (b.block_type || b.type) === type);
            if (match) return match;
        }
        return null;
    };

    const heroBlock: any = findBlockByType('hero');
    const heroContent = heroBlock ? heroBlock.content || heroBlock.content_json || {} : {};

    const featuresBlock: any = findBlockByType('features');
    const featuresContent = featuresBlock ? featuresBlock.content || featuresBlock.content_json || {} : {};
    const dynamicFeatures = Array.isArray(featuresContent.features) ? featuresContent.features : [];

    const heading =
        heroContent.heading || page.seo_meta?.meta_title || page.title || 'Contact Us';

    const defaultDescription =
        'Share a bit about your use case, team, and tools. We will follow up with next steps and a tailored walkthrough.';

    const subheading =
        heroContent.subheading || page.seo_meta?.meta_description || defaultDescription;

    const supportItems =
        dynamicFeatures.length > 0
            ? dynamicFeatures
            : [
                  {
                      title: 'Tell us about your workflow',
                      description: 'A quick overview of where you want Totan.ai to plug in.',
                  },
                  {
                      title: 'We map the right setup',
                      description:
                          'We suggest templates, automations, and integrations that fit your stack.',
                  },
                  {
                      title: 'You launch with confidence',
                      description:
                          'Ship a working setup instead of another internal document full of ideas.',
                  },
              ];
    return (
        <div className="bg-slate-950 min-h-screen text-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <p className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
                            Contact us
                        </p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                            {heading}
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                            {subheading}
                        </p>

                        <div className="space-y-4 text-sm text-slate-300">
                            {supportItems.map((item: any, index: number) => {
                                const title =
                                    typeof item === 'string' ? item : item.title || `Step ${index + 1}`;
                                const description =
                                    typeof item === 'string' ? '' : item.description || '';

                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <span className="mt-0.5 h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-xs">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium">{title}</p>
                                            {description && (
                                                <p className="text-slate-400">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-2 text-xs text-slate-500">
                            <p>Response time: usually within one business day.</p>
                            <p>No spam, no sharing your details with third parties.</p>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 blur-2xl" />
                            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Full name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                                            placeholder="Sarah Lee"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Work email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Team size
                                        </label>
                                        <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60">
                                            <option value="">Select</option>
                                            <option value="1-5">1-5</option>
                                            <option value="6-20">6-20</option>
                                            <option value="21-100">21-100</option>
                                            <option value="100+">100+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-300 mb-1">
                                        What are you hoping to use Totan.ai for?
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                                        placeholder="Describe your current workflow, pain points, and any tools you want to connect."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            How soon are you looking to start?
                                        </label>
                                        <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60">
                                            <option value="">Select</option>
                                            <option value="immediately">Immediately</option>
                                            <option value="this-quarter">This quarter</option>
                                            <option value="exploring">Just exploring</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Monthly budget range
                                        </label>
                                        <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60">
                                            <option value="">Select</option>
                                            <option value="<500">&lt;$500</option>
                                            <option value="500-2k">$500 – $2k</option>
                                            <option value="2k-10k">$2k – $10k</option>
                                            <option value="10k+">$10k+</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-emerald-950 shadow-sm hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
                                >
                                    Submit message
                                </button>

                                <p className="text-xs text-slate-500 text-center">
                                    By submitting, you agree to let us contact you about Totan.ai. No newsletter signups
                                    unless you explicitly opt in elsewhere.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2 text-xs text-slate-500">
                            <p>
                                Prefer email? Reach us at{' '}
                                <a href="mailto:support@totan.ai" className="text-emerald-400 hover:text-emerald-300">
                                    support@totan.ai
                                </a>
                            </p>
                            <p>For security reports, use security@totan.ai.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContactDark;
