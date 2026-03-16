import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';

type FormState = {
    name: string;
    email: string;
    company: string;
    phone: string;
    subject: string;
    message: string;
};

const ContactPage: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const metaTitle = 'Contact Totan.ai | Talk to an AI Automation Expert';
    const metaDescription = 'Contact Totan.ai to discuss AI automation, integrations, and workflow optimization. Get a clear rollout plan and measurable outcomes.';

    const canSubmit = useMemo(() => {
        return form.email.trim().length > 3 && !submitting;
    }, [form.email, submitting]);

    const update = (key: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await api.post('/contact', {
                ...form,
                source: 'contact_page',
                source_url: typeof window !== 'undefined' ? window.location.href : undefined,
            });
            setSent(true);
            setForm({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to submit. Please try again.';
            setError(String(message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pt-28 pb-20">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-6">
                        <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-200">
                            Contact
                        </div>
                        <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight">
                            Talk to an AI automation expert
                        </h1>
                        <p className="mt-4 text-base text-slate-300 max-w-xl">
                            Share your goal and stack. We’ll reply with a clear rollout plan and next steps.
                        </p>

                        <div className="mt-10 rounded-3xl bg-slate-900/40 border border-slate-800 p-6">
                            <p className="text-sm font-semibold text-white">What to include</p>
                            <ul className="mt-3 space-y-2 text-base text-slate-300">
                                <li>Workflow to automate</li>
                                <li>Systems you use (CRM, ticketing, ERP, etc.)</li>
                                <li>Constraints (security, approvals, compliance)</li>
                                <li>Target outcomes (time saved, accuracy, throughput)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="rounded-3xl bg-black/40 border border-slate-800 p-6">
                            <p className="text-base font-semibold text-white">Send a message</p>
                            <p className="mt-2 text-base text-slate-300">
                                Typical response: 1 business day.
                            </p>

                            {sent && (
                                <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-base text-emerald-100">
                                    Thanks — your message was sent.
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-base text-red-100">
                                    {error}
                                </div>
                            )}

                            <form className="mt-6 space-y-4" onSubmit={submit}>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => update('name', e.target.value)}
                                        placeholder="Name"
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => update('email', e.target.value)}
                                        placeholder="Work email"
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={(e) => update('company', e.target.value)}
                                        placeholder="Company"
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => update('phone', e.target.value)}
                                        placeholder="Phone (optional)"
                                        className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) => update('subject', e.target.value)}
                                    placeholder="Subject (optional)"
                                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <textarea
                                    value={form.message}
                                    onChange={(e) => update('message', e.target.value)}
                                    placeholder="What do you want to automate? Include systems, constraints, and outcomes."
                                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-h-[140px]"
                                />

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full inline-flex items-center justify-center rounded-xl bg-white text-slate-950 text-sm font-semibold py-3 hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Sending...' : 'Send message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

