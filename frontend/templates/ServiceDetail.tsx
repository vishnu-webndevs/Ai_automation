import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { Helmet } from 'react-helmet-async';
import { api, serviceService } from '../services/api';

type ServicePageFAQ = {
    question: string;
    shortAnswer: string;
    expandedAnswer: string;
};

type ServicePageContext = {
    industry: string;
    country?: string;
    city?: string;
    businessType?: string;
    automationType: string;
    toolStack: string[];
    targetProblem: string;
};

const compact = (value: unknown) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const csvToList = (value: string) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const take = <T,>(items: T[], limit: number) => items.slice(0, clamp(limit, 0, items.length));

const ensureArray = <T,>(value: unknown, fallback: T[]): T[] => (Array.isArray(value) ? (value as T[]) : fallback);

const interpolate = (template: string, vars: Record<string, string>) =>
    template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{${key}}`));

const buildFaqSchema = (faqs: ServicePageFAQ[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.expandedAnswer,
        },
    })),
});

const SectionShell: React.FC<{
    id: string;
    eyebrow?: string;
    title: string;
    children: React.ReactNode;
}> = ({ id, eyebrow, title, children }) => (
    <section id={id} className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                {eyebrow && <div className="text-sm font-semibold tracking-[0.25em] uppercase text-purple-300 mb-2">{eyebrow}</div>}
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    </section>
);

const ServiceDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const { data: service, isLoading, error } = useSWR(slug ? `service-${slug}` : null, () => serviceService.getBySlug(slug!));
    const { data: allServices } = useSWR('services-all', () => serviceService.getAll());
    const [quickEmail, setQuickEmail] = useState('');
    const [quickMessage, setQuickMessage] = useState('');
    const [quickSubmitting, setQuickSubmitting] = useState(false);
    const [quickSent, setQuickSent] = useState(false);
    const [quickError, setQuickError] = useState<string | null>(null);

    const resolvedContext = useMemo<ServicePageContext>(() => {
        const industry = compact(searchParams.get('industry')) || 'your industry';
        const country = compact(searchParams.get('country')) || undefined;
        const city = compact(searchParams.get('city')) || undefined;
        const businessType = compact(searchParams.get('business_type')) || undefined;
        const automationType = compact(searchParams.get('automation_type')) || 'automation';
        const targetProblem = compact(searchParams.get('target_problem')) || 'manual workflows and operational bottlenecks';
        const toolStackParam = compact(searchParams.get('tool_stack'));
        const toolStack = toolStackParam ? csvToList(toolStackParam) : ['OpenAI', 'LangChain', 'Python', 'Node.js', 'Zapier', 'REST APIs'];

        return {
            industry,
            country,
            city,
            businessType,
            automationType,
            toolStack,
            targetProblem,
        };
    }, [searchParams]);

    const serviceName = compact((service as any)?.name) || 'Service';
    const serviceIcon = compact((service as any)?.icon) || '🤖';
    const shortDescription =
        compact((service as any)?.short_description) ||
        `${serviceName} helps teams modernize ${resolvedContext.automationType} to reduce delays, improve accuracy, and scale operations.`;

    const longDescriptionHtml = compact((service as any)?.full_description);
    const features = ensureArray<any>((service as any)?.features, []);
    const serviceContent = (service as any)?.content_json || (service as any)?.contentJson || (service as any)?.content || null;
    const templateVars = useMemo(
        () => ({
            service_name: serviceName,
            industry: resolvedContext.industry,
            country: resolvedContext.country || '',
            city: resolvedContext.city || '',
            business_type: resolvedContext.businessType || '',
            automation_type: resolvedContext.automationType,
            tool_stack: resolvedContext.toolStack.join(', '),
            target_problem: resolvedContext.targetProblem,
        }),
        [
            resolvedContext.automationType,
            resolvedContext.businessType,
            resolvedContext.city,
            resolvedContext.country,
            resolvedContext.industry,
            resolvedContext.targetProblem,
            resolvedContext.toolStack,
            serviceName,
        ]
    );

    const submitQuickBrief = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setQuickError(null);
            setQuickSent(false);
            setQuickSubmitting(true);
            try {
                await api.post('/contact', {
                    email: quickEmail,
                    message: quickMessage,
                    subject: `${serviceName} inquiry`,
                    source: 'service_quick_brief',
                    source_url: typeof window !== 'undefined' ? window.location.href : undefined,
                });
                setQuickSent(true);
                setQuickEmail('');
                setQuickMessage('');
            } catch (err: any) {
                const message = err?.response?.data?.message || 'Failed to submit. Please try again.';
                setQuickError(String(message));
            } finally {
                setQuickSubmitting(false);
            }
        },
        [quickEmail, quickMessage, serviceName]
    );

    const t = useCallback(
        (value: unknown) => interpolate(typeof value === 'string' ? value : '', templateVars),
        [templateVars]
    );
    const relatedServiceLinks = useMemo(() => {
        const structured = ensureArray<any>(serviceContent?.related_services, []);
        if (structured.length > 0) {
            return take(
                structured.map((item: any, idx: number) => ({
                    title: t(item.title) || `Related service ${idx + 1}`,
                    href: compact(item.href || item.url) || '/services',
                    text: t(item.summary || item.text) || 'Explore a related service offering.',
                })),
                8
            );
        }

        const resolvedAll = ensureArray<any>(allServices, []);
        const candidates = resolvedAll
            .filter((s: any) => compact(s.slug) && compact(s.slug) !== compact((service as any)?.slug))
            .filter((s: any) => {
                const currentCategory = compact((service as any)?.category?.slug);
                const candidateCategory = compact(s?.category?.slug);
                if (!currentCategory || !candidateCategory) return true;
                return currentCategory === candidateCategory;
            })
            .slice(0, 4)
            .map((s: any) => ({
                title: compact(s.name) || 'Related service',
                href: `/services/${compact(s.slug)}`,
                text: t(compact(s.short_description) || 'Explore this service to find the best-fit workflow improvements.'),
            }));

        if (candidates.length > 0) return candidates;

        return [];
    }, [allServices, service, serviceContent, t]);

    const featureCards = useMemo(
        () =>
            (ensureArray<any>(serviceContent?.features, []).length > 0 || features.length > 0)
                ? take(
                      (ensureArray<any>(serviceContent?.features, []).length > 0 ? ensureArray<any>(serviceContent?.features, []) : features).map((feature: any, idx: number) => ({
                          title: t(compact(feature.title || feature.name) || `Feature ${idx + 1}`),
                          description:
                              t(compact(feature.description) || 'Configured to match your workflows, data access rules, and operational guardrails.'),
                      })),
                      8
                  )
                : [],
        [features, serviceContent, t]
    );

    const problemCards = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.problems, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title || item.problem_title) || `Problem ${idx + 1}`),
                        description: t(compact(item.description || item.summary) || 'A common operational challenge teams want to eliminate.'),
                    })),
                    6
                );
            }

            return [];
        },
        [resolvedContext.industry, serviceContent, t]
    );

    const solutionBullets = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.solution_bullets || serviceContent?.solution?.bullets, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title) || `Solution ${idx + 1}`),
                        text: t(compact(item.text || item.description) || 'Outcome-focused implementation detail tailored to your workflow.'),
                    })),
                    6
                );
            }

            return [];
        },
        [resolvedContext.automationType, serviceContent, t]
    );

    const benefits = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.benefits, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title || item.benefit_title) || `Benefit ${idx + 1}`),
                        text: t(compact(item.text || item.description || item.benefit_explanation) || 'A measurable improvement tied to operational outcomes.'),
                    })),
                    8
                );
            }

            return [];
        },
        [serviceContent, t]
    );

    const useCases = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.use_cases, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title) || `Use case ${idx + 1}`),
                        industry: t(compact(item.industry) || resolvedContext.industry),
                        text: t(compact(item.summary || item.text || item.description) || 'A real-world scenario for this service.'),
                    })),
                    8
                );
            }

            return [];
        },
        [resolvedContext.industry, serviceContent, t]
    );

    const processSteps = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.process_steps, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title) || `Step ${idx + 1}`),
                        text: t(compact(item.description || item.text) || 'A step in the delivery process.'),
                    })),
                    10
                );
            }

            return [];
        },
        [resolvedContext.targetProblem, resolvedContext.toolStack, serviceContent, t]
    );

    const techStackItems = useMemo(() => {
        const structured = ensureArray<any>(serviceContent?.tech_stack, []);
        if (structured.length > 0) {
            return structured.map((item: any) => t(String(item))).filter(Boolean);
        }
        return resolvedContext.toolStack.map((item) => t(item)).filter(Boolean);
    }, [resolvedContext.toolStack, serviceContent, t]);

    const industryApplications = useMemo(
        () => {
            const structured = ensureArray<any>(serviceContent?.industry_applications, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        title: t(compact(item.title) || `Industry ${idx + 1}`),
                        text: t(compact(item.body || item.text) || 'A common industry application of this service.'),
                    })),
                    12
                );
            }

            return [];
        },
        [serviceContent, t]
    );

    const comparison = useMemo(() => {
        const structured = ensureArray<any>(serviceContent?.comparison?.rows, []);
        if (structured.length > 0) {
            const leftLabel = t(compact(serviceContent?.comparison?.left_label) || 'Manual Processes');
            const rightLabel = t(compact(serviceContent?.comparison?.right_label) || serviceName);
            const rows = take(
                structured.map((row: any, idx: number) => ({
                    topic: t(compact(row.topic) || `Area ${idx + 1}`),
                    left: t(compact(row.left) || ''),
                    right: t(compact(row.right) || ''),
                })),
                10
            );
            return { leftLabel, rightLabel, rows };
        }

        return { leftLabel: '', rightLabel: '', rows: [] };
    }, [serviceContent, serviceName, t]);

    const roiCards = useMemo(() => {
        const structured = ensureArray<any>(serviceContent?.roi?.highlights, []);
        if (structured.length > 0) {
            return take(
                structured.map((item: any, idx: number) => ({
                    title: t(compact(item.title) || `ROI ${idx + 1}`),
                    value: t(compact(item.value) || ''),
                    note: t(compact(item.note) || ''),
                })),
                8
            );
        }
        return [];
    }, [serviceContent, t]);

    const faqItems = useMemo<ServicePageFAQ[]>(
        () => {
            const structured = ensureArray<any>(serviceContent?.faqs, []);
            if (structured.length > 0) {
                return take(
                    structured.map((item: any, idx: number) => ({
                        question: t(compact(item.question) || `FAQ ${idx + 1}`),
                        shortAnswer: t(compact(item.short_answer || item.shortAnswer || item.answer) || 'A short answer aligned to your service scope.'),
                        expandedAnswer: t(compact(item.expanded_answer || item.expandedAnswer || item.answer) || 'An expanded answer for users who want more detail.'),
                    })),
                    8
                );
            }

            return [];
        },
        [resolvedContext.automationType, resolvedContext.industry, serviceContent, serviceName, t]
    );

    const emptySectionText = useMemo(
        () => t('Content not generated yet. Generate AI content from admin panel.'),
        [t]
    );

    const faqSchema = useMemo(() => buildFaqSchema(faqItems), [faqItems]);

    const metaTitle = useMemo(() => {
        const fromContent = compact(serviceContent?.meta_title || serviceContent?.seo?.title || serviceContent?.seo?.meta_title);
        if (fromContent) return t(fromContent);
        const industryValue = resolvedContext.industry === 'your industry' ? '' : resolvedContext.industry;
        const location = resolvedContext.city && resolvedContext.country ? ` in ${resolvedContext.city}, ${resolvedContext.country}` : resolvedContext.country ? ` in ${resolvedContext.country}` : '';
        return `${industryValue ? `${serviceName} for ${industryValue}` : serviceName}${location} | Totan.ai`;
    }, [resolvedContext.city, resolvedContext.country, resolvedContext.industry, serviceContent, serviceName, t]);

    const metaDescription = useMemo(() => {
        const fromContent = compact(serviceContent?.meta_description || serviceContent?.seo?.meta_description || serviceContent?.seo?.og_description);
        if (fromContent) return t(fromContent);
        const industryValue = resolvedContext.industry === 'your industry' ? '' : resolvedContext.industry;
        const location = resolvedContext.city && resolvedContext.country ? `${resolvedContext.city}, ${resolvedContext.country}` : resolvedContext.country ? resolvedContext.country : '';
        const locationPhrase = location ? ` in ${location}` : '';
        return industryValue
            ? `High-converting ${serviceName}${locationPhrase} for ${industryValue}. Automate ${resolvedContext.automationType}, reduce manual work, and improve operational efficiency with Totan.ai.`
            : `High-converting ${serviceName}${locationPhrase}. Automate ${resolvedContext.automationType}, reduce manual work, and improve operational efficiency with Totan.ai.`;
    }, [resolvedContext.automationType, resolvedContext.country, resolvedContext.city, resolvedContext.industry, serviceContent, serviceName, t]);

    const tocItems = useMemo(
        () => [
            { id: 'intro', label: 'Overview' },
            { id: 'problems', label: 'Problems' },
            { id: 'solution', label: 'Solution' },
            { id: 'features', label: 'Features' },
            { id: 'benefits', label: 'Benefits' },
            { id: 'use-cases', label: 'Use Cases' },
            { id: 'process', label: 'How It Works' },
            { id: 'tech', label: 'Tech Stack' },
            { id: 'industries', label: 'Industries' },
            { id: 'comparison', label: 'Comparison' },
            { id: 'roi', label: 'ROI' },
            { id: 'related', label: 'Related' },
            { id: 'faq', label: 'FAQ' },
        ],
        []
    );

    const heroCopy = useMemo(() => {
        const hero = serviceContent?.hero;
        const industryValue = resolvedContext.industry === 'your industry' ? '' : resolvedContext.industry;
        const headline = t(compact(hero?.headline) || serviceName);
        const subheadline = t(
            compact(hero?.subheadline) ||
                `Automate ${resolvedContext.automationType} to reduce ${resolvedContext.targetProblem}.`
        );
        const primaryCta = t(compact(hero?.primary_cta_label) || 'Book a Free Consultation');
        const secondaryCta = t(compact(hero?.secondary_cta_label) || 'See Use Cases');
        const trustText = t(compact(hero?.trust_text) || 'Trusted by international teams · Designed for measurable outcomes');
        const baseDescription = t(compact(hero?.short_description) || shortDescription);
        const description =
            baseDescription.length < 60
                ? t(
                      `${baseDescription} Designed for ${industryValue || 'modern'} teams to improve speed, accuracy, and operational visibility.`
                  )
                : baseDescription;

        return { headline, subheadline, primaryCta, secondaryCta, trustText, description };
    }, [resolvedContext.automationType, resolvedContext.industry, resolvedContext.targetProblem, serviceContent, serviceName, shortDescription, t]);

    const heroHighlights = useMemo(() => {
        const structured = ensureArray<string>(serviceContent?.intro?.key_outcomes, []);
        const resolved =
            structured.length > 0
                ? take(structured, 3).map((item) => t(String(item)))
                : [
                      t('Reduce manual steps and handoffs'),
                      t('Improve consistency and accuracy'),
                      t('Scale operations without chaos'),
                  ];
        return resolved.filter(Boolean);
    }, [serviceContent, t]);

    const heroChips = useMemo(() => {
        const items: string[] = [];
        if (resolvedContext.industry && resolvedContext.industry !== 'your industry') items.push(`For ${resolvedContext.industry}`);
        if (resolvedContext.country) {
            items.push(resolvedContext.city ? `${resolvedContext.city}, ${resolvedContext.country}` : resolvedContext.country);
        }
        if (resolvedContext.automationType && resolvedContext.automationType !== 'automation') items.push(resolvedContext.automationType);
        return items.map((label) => t(label));
    }, [resolvedContext.automationType, resolvedContext.city, resolvedContext.country, resolvedContext.industry, t]);

    if (isLoading) return <div className="text-center py-20 text-white">Loading service...</div>;
    if (error || !service) return <div className="text-center py-20 text-white">Service not found</div>;

    return (
        <div className="bg-slate-950 min-h-screen">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>

            <header className="relative pt-24 sm:pt-28 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-r via-purple-900/35 to-slate-950 pointer-events-none" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-purple-500/20 blur-[110px] pointer-events-none" />
                <div className="absolute top-28 right-0 w-[520px] h-[520px] bg-blue-500/10 blur-[120px] pointer-events-none" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                        <div className="lg:col-span-7">
                            <div className="text-sm text-slate-400 mb-4">
                                <a href="/" className="hover:text-white transition-colors">Home</a>
                                <span className="mx-2 text-slate-600">/</span>
                                <a href="/services" className="hover:text-white transition-colors">Services</a>
                                <span className="mx-2 text-slate-600">/</span>
                                <span className="text-slate-200">{serviceName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
                                    Global delivery
                                </span>
                                {heroChips.map((chip) => (
                                    <span
                                        key={chip}
                                        className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-sm font-semibold text-purple-100"
                                    >
                                        {chip}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                                {heroCopy.headline}
                            </h1>
                            <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-3xl">
                                {heroCopy.subheadline}
                            </p>
                            <p className="mt-3 text-base text-slate-300 max-w-3xl">
                                {heroCopy.description}
                            </p>
                            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-3xl">
                                {heroHighlights.map((item) => (
                                    <div key={item} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                                        <div className="text-base text-slate-200 leading-relaxed">{item}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a
                                    href="/contact-us"
                                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm font-semibold text-white px-6 py-3 hover:from-purple-600 hover:to-blue-600 transition-colors"
                                >
                                    {heroCopy.primaryCta}
                                </a>
                                <a
                                    href="#use-cases"
                                    className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-white px-6 py-3 hover:bg-white/15 transition-colors"
                                >
                                    {heroCopy.secondaryCta}
                                </a>
                            </div>
                            <div className="mt-4 text-sm text-slate-400 max-w-3xl">
                                {heroCopy.trustText}
                            </div>
                        </div>

                        <aside className="lg:col-span-5 lg:sticky lg:top-28">
                            <div className="rounded-3xl bg-black/40 border border-slate-800 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-2xl">
                                        <span>{serviceIcon}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">Get a rollout plan</div>
                                        <div className="text-sm text-slate-400">Share your goal and stack</div>
                                    </div>
                                </div>
                                {quickSent && (
                                    <div className="mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-base text-emerald-100">
                                        Thanks — we received your message.
                                    </div>
                                )}
                                {quickError && (
                                    <div className="mb-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-base text-red-100">
                                        {quickError}
                                    </div>
                                )}
                                <form className="space-y-3" onSubmit={submitQuickBrief}>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Work email"
                                        value={quickEmail}
                                        onChange={(e) => setQuickEmail(e.target.value)}
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <textarea
                                        placeholder={`What are you trying to improve? (e.g., ${resolvedContext.targetProblem})`}
                                        value={quickMessage}
                                        onChange={(e) => setQuickMessage(e.target.value)}
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-h-[90px]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={quickSubmitting || quickEmail.trim().length === 0}
                                        className="w-full inline-flex items-center justify-center rounded-xl bg-white text-slate-950 text-sm font-semibold py-2.5 hover:bg-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        {quickSubmitting ? 'Sending...' : 'Talk to an Expert'}
                                    </button>
                                </form>
                                <div className="mt-3 text-sm text-slate-400">
                                    Typical response: 1 business day
                                </div>
                            </div>

                            <nav className="mt-6 rounded-3xl bg-slate-900/40 border border-slate-800 p-5">
                                <div className="text-sm font-semibold tracking-[0.25em] uppercase text-slate-400 mb-3">
                                    On this page
                                </div>
                                <ul className="grid grid-cols-2 gap-2 text-sm">
                                    {tocItems.map((item) => (
                                        <li key={item.id}>
                                            <a href={`#${item.id}`} className="text-slate-200 hover:text-white transition-colors">
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </aside>
                    </div>
                </div>
            </header>

            <main>
                <SectionShell id="intro" eyebrow="Overview" title="Overview">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7">
                            <p className="text-base text-slate-200 leading-relaxed">
                                {compact(serviceContent?.intro?.body) ? t(compact(serviceContent?.intro?.body)) : emptySectionText}
                            </p>
                            {!compact(serviceContent?.intro?.body) && longDescriptionHtml && (
                                <div className="mt-6 rounded-3xl bg-slate-900/40 border border-slate-800 p-6">
                                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: longDescriptionHtml }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-5">
                            <div className="rounded-3xl bg-gradient-to-b from-purple-500/10 to-slate-950/60 border border-purple-500/25 p-6">
                                <div className="text-sm font-semibold tracking-[0.25em] uppercase text-purple-200 mb-4">
                                    Key outcomes
                                </div>
                                <ul className="space-y-3 text-base text-slate-200">
                                    {ensureArray<string>(serviceContent?.intro?.key_outcomes, []).length === 0 ? (
                                        <li className="text-slate-300">{emptySectionText}</li>
                                    ) : (
                                        take(ensureArray<string>(serviceContent?.intro?.key_outcomes, []), 6)
                                            .map((item) => t(String(item)))
                                            .filter(Boolean)
                                            .map((item) => (
                                                <li key={item} className="flex gap-3">
                                                    <span className="text-purple-200">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                <SectionShell id="problems" eyebrow="Pain Points" title={`Problems ${serviceName} helps solve`}>
                    {problemCards.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {problemCards.map((problem) => (
                                <article key={problem.title} className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                    <h3 className="text-base font-semibold text-white mb-2">
                                        {problem.title}
                                    </h3>
                                    <p className="text-base text-slate-300 leading-relaxed">
                                        {problem.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="solution" eyebrow="Solution" title={`How ${serviceName} addresses these challenges`}>
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7">
                            {solutionBullets.length === 0 ? (
                                <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                                    {emptySectionText}
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {solutionBullets.map((item) => (
                                        <li key={item.title} className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5">
                                            <h3 className="text-base font-semibold text-white mb-1.5">
                                                {item.title}
                                            </h3>
                                            <p className="text-base text-slate-300 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="lg:col-span-5">
                            <div className="rounded-3xl bg-gradient-to-b from-emerald-500/12 via-slate-950/70 to-slate-950 border border-emerald-400/25 p-6">
                                <div className="text-sm font-semibold tracking-[0.25em] uppercase text-emerald-200 mb-2">
                                    Outcome focus
                                </div>
                                <p className="text-base text-slate-200 leading-relaxed">
                                    {compact(serviceContent?.hero?.subheadline) ? t(compact(serviceContent?.hero?.subheadline)) : emptySectionText}
                                </p>
                                <a
                                    href="/contact-us"
                                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-sm font-semibold px-5 py-2.5 hover:bg-slate-200 transition-colors"
                                >
                                    Request a rollout plan
                                </a>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                <SectionShell id="features" eyebrow="Capabilities" title="Key features">
                    {featureCards.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featureCards.map((feature) => (
                                <article key={feature.title} className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                    <h3 className="text-base font-semibold text-white mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-base text-slate-300 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="benefits" eyebrow="Benefits" title="Business outcomes">
                    {benefits.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {benefits.map((benefit) => (
                                <article key={benefit.title} className="rounded-3xl bg-gradient-to-b from-purple-500/10 to-slate-950/70 border border-purple-500/20 p-5">
                                    <h3 className="text-base font-semibold text-white mb-1.5">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-base text-slate-300 leading-relaxed">
                                        {benefit.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="use-cases" eyebrow="Use Cases" title={`Real-world use cases for ${resolvedContext.industry}`}>
                    {useCases.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {useCases.map((useCase) => (
                                <article key={useCase.title} className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                    <h3 className="text-base font-semibold text-white mb-2">
                                        {useCase.title}
                                    </h3>
                                    <div className="text-sm text-slate-300 mb-3">
                                        Industry: {useCase.industry}
                                    </div>
                                    <p className="text-base text-slate-300 leading-relaxed">
                                        {useCase.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="process" eyebrow="Process" title="How it works">
                    {processSteps.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <ol className="grid lg:grid-cols-3 gap-5">
                            {processSteps.map((step, idx) => (
                                <li key={step.title} className="rounded-3xl bg-slate-950/60 border border-slate-800 p-5">
                                    <div className="text-sm font-semibold text-purple-200 mb-2">
                                        Step {idx + 1}
                                    </div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">
                                        {step.title}
                                    </h3>
                                    <p className="text-base text-slate-300 leading-relaxed">
                                        {step.text}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </SectionShell>

                <SectionShell id="tech" eyebrow="Technology" title="Technology stack">
                    <div className="flex flex-wrap gap-2">
                        {techStackItems.map((tool) => (
                            <span
                                key={tool}
                                className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-slate-200"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell id="industries" eyebrow="Industries" title={`Industry applications of ${serviceName}`}>
                    {industryApplications.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {industryApplications.map((item) => (
                                <details key={item.title} className="group rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                    <summary className="cursor-pointer list-none">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="text-base font-semibold text-white">
                                                {item.title}
                                            </h3>
                                            <span className="text-slate-400 group-open:text-slate-200 text-sm">
                                                Expand
                                            </span>
                                        </div>
                                    </summary>
                                    <p className="mt-3 text-base text-slate-300 leading-relaxed">
                                        {item.text}
                                    </p>
                                </details>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="comparison" eyebrow="Comparison" title={`Manual processes vs ${serviceName}`}>
                    {comparison.rows.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-slate-800">
                            <div className="grid grid-cols-3 bg-slate-900/60">
                                <div className="p-4 text-sm font-semibold text-slate-300">Area</div>
                                <div className="p-4 text-sm font-semibold text-slate-300">{comparison.leftLabel}</div>
                                <div className="p-4 text-sm font-semibold text-slate-300">{comparison.rightLabel}</div>
                            </div>
                            {comparison.rows.map((row) => (
                                <div key={row.topic} className="grid grid-cols-3 border-t border-slate-800 bg-slate-950/40">
                                    <div className="p-4 text-sm text-white font-semibold">{row.topic}</div>
                                    <div className="p-4 text-sm text-slate-300">{row.left}</div>
                                    <div className="p-4 text-sm text-slate-300">{row.right}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="roi" eyebrow="Impact" title="ROI and business impact">
                    {roiCards.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {roiCards.map((card) => (
                                <article key={card.title} className="rounded-3xl bg-gradient-to-b from-emerald-500/10 to-slate-950/70 border border-emerald-400/20 p-5">
                                    <div className="text-sm font-semibold text-emerald-200 mb-2">{card.title}</div>
                                    <div className="text-base font-bold text-white mb-1">{card.value}</div>
                                    <div className="text-base text-slate-300 leading-relaxed">{card.note}</div>
                                </article>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="related" eyebrow="Internal Links" title="Related services">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {relatedServiceLinks.map((link) => (
                            <a
                                key={link.title}
                                href={link.href}
                                className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 hover:border-slate-700 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-white mb-1.5">
                                    {link.title}
                                </h3>
                                <p className="text-base text-slate-300 leading-relaxed">
                                    {link.text}
                                </p>
                            </a>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell id="faq" eyebrow="FAQ" title="Frequently asked questions">
                    {faqItems.length === 0 ? (
                        <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                            {emptySectionText}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {faqItems.map((faq) => (
                                <details key={faq.question} className="group rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                    <summary className="cursor-pointer list-none">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-white mb-1">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-base text-slate-300">
                                                    {faq.shortAnswer}
                                                </p>
                                            </div>
                                            <span className="text-sm text-slate-400 group-open:text-slate-200">
                                                Expand
                                            </span>
                                        </div>
                                    </summary>
                                    <p className="mt-3 text-base text-slate-300 leading-relaxed">
                                        {faq.expandedAnswer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <SectionShell id="seo" eyebrow="SEO" title={`More about ${serviceName}`}>
                    <div className="space-y-3">
                        {ensureArray<any>(serviceContent?.seo_expanders, []).length === 0 ? (
                            <div className="rounded-3xl bg-slate-900/45 border border-slate-800 p-5 text-slate-300">
                                {emptySectionText}
                            </div>
                        ) : (
                            take(ensureArray<any>(serviceContent?.seo_expanders, []), 6)
                                .map((item: any, idx: number) => ({
                                    title: t(compact(item.title) || `SEO topic ${idx + 1}`),
                                    body: t(compact(item.body || item.text) || 'Additional SEO-focused detail for long-tail queries.'),
                                }))
                                .map((block) => (
                                    <details key={block.title} className="group rounded-3xl bg-slate-900/45 border border-slate-800 p-5">
                                        <summary className="cursor-pointer list-none">
                                            <h3 className="text-base font-semibold text-white">
                                                {block.title}
                                            </h3>
                                        </summary>
                                        <p className="mt-3 text-base text-slate-300 leading-relaxed">
                                            {block.body}
                                        </p>
                                    </details>
                                ))
                        )}
                    </div>
                </SectionShell>

                {(resolvedContext.country || resolvedContext.city) && (
                    <SectionShell
                        id="location"
                        eyebrow="Location"
                        title={`${serviceName} in ${resolvedContext.city ? `${resolvedContext.city}, ` : ''}${resolvedContext.country || ''}`}
                    >
                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-7">
                                <p className="text-base text-slate-200 leading-relaxed">
                                    {compact(serviceContent?.location?.body) ? t(compact(serviceContent?.location?.body)) : emptySectionText}
                                </p>
                            </div>
                            <div className="lg:col-span-5">
                                <div className="rounded-3xl bg-slate-950/60 border border-slate-800 p-6">
                                    <div className="text-sm font-semibold tracking-[0.25em] uppercase text-slate-400 mb-4">
                                        Coverage
                                    </div>
                                    <ul className="space-y-3 text-base text-slate-300">
                                        <li className="flex gap-3">
                                            <span className="text-purple-200">•</span>
                                            <span>Remote workshops and delivery</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-purple-200">•</span>
                                            <span>Timezone-aware collaboration</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-purple-200">•</span>
                                            <span>Documented handover and operational playbooks</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </SectionShell>
                )}

                <section className="px-4 sm:px-6 lg:px-8 pb-20 pt-6">
                    <div className="max-w-6xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-purple-900 via-slate-950 to-emerald-900 border border-slate-800 overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="p-8 md:p-10 flex flex-col justify-center">
                            <div className="text-sm font-semibold tracking-[0.25em] uppercase text-purple-200 mb-2">
                                    Final step
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    Ready to automate your business processes?
                                </h2>
                                <p className="text-base text-slate-200 mb-6">
                                    Get a clear plan for {resolvedContext.automationType} in {resolvedContext.industry}, including scope, integrations, and measurable outcomes.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="/contact-us"
                                        className="inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-sm font-semibold px-6 py-2.5 hover:bg-slate-200 transition-colors"
                                    >
                                        Book a Free Consultation
                                    </a>
                                    <a
                                        href="#process"
                                        className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-white px-6 py-2.5 hover:bg-white/15 transition-colors"
                                    >
                                        Review the process
                                    </a>
                                </div>
                            </div>
                            <div className="relative bg-gradient-to-tl from-black via-purple-900/40 to-emerald-900/40">
                                <div className="absolute -bottom-16 right-0 left-0 mx-auto w-64 h-64 rounded-full bg-purple-500/40 blur-[80px]" />
                                <div className="relative h-full flex items-center justify-center py-12">
                                    <div className="w-40 h-40 rounded-full border border-purple-300/50 bg-black/40 flex items-center justify-center text-5xl">
                                        <span>{serviceIcon}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ServiceDetail;
