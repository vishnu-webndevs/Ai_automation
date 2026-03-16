import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getAiSettings, updateOpenAiSettings } from '../api';

type AiSettingsResponse = {
    openai: {
        has_key: boolean;
        model: string;
    };
};

const AiSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [openAiHasKey, setOpenAiHasKey] = useState(false);
    const [openAiModel, setOpenAiModel] = useState('gpt-4o');
    const [openAiKey, setOpenAiKey] = useState('');
    const [clearKey, setClearKey] = useState(false);

    const canSave = useMemo(() => {
        if (saving) return false;
        if (clearKey) return true;
        return openAiKey.trim().length > 0 || openAiModel.trim().length > 0;
    }, [clearKey, openAiKey, openAiModel, saving]);

    const load = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await getAiSettings();
            const data = res.data as AiSettingsResponse;
            setOpenAiHasKey(!!data?.openai?.has_key);
            setOpenAiModel(data?.openai?.model || 'gpt-4o');
            setOpenAiKey('');
            setClearKey(false);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load AI settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const onSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await updateOpenAiSettings({
                api_key: clearKey ? undefined : openAiKey.trim() || undefined,
                model: openAiModel.trim() || undefined,
                clear_key: clearKey || undefined,
            });
            setSuccess('Saved');
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
                <div className="text-sm text-gray-500 mt-1">Manage provider keys securely. Keys are never shown again after saving.</div>
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            {success && <div className="mb-4 text-sm text-emerald-700">{success}</div>}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">OpenAI</h2>
                            <div className="text-sm text-gray-500 mt-1">
                                Status: {openAiHasKey ? <span className="text-emerald-700">Key saved</span> : <span className="text-red-700">No key</span>}
                            </div>
                        </div>
                        <Button onClick={onSave} disabled={!canSave || loading} isLoading={saving}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                <Input
                                    value={openAiModel}
                                    onChange={(e) => setOpenAiModel(e.target.value)}
                                    placeholder="e.g. gpt-4o"
                                />
                            </div>

                            <div className="lg:col-span-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                <Input
                                    type="password"
                                    value={openAiKey}
                                    onChange={(e) => {
                                        setOpenAiKey(e.target.value);
                                        if (e.target.value.trim()) setClearKey(false);
                                    }}
                                    placeholder={openAiHasKey ? '•••••••• (already saved)' : 'Paste your OpenAI API key'}
                                />
                                <div className="mt-2 text-xs text-gray-500">
                                    For security, the key is stored encrypted and is never displayed.
                                </div>
                            </div>

                            <div className="lg:col-span-12">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={clearKey}
                                        onChange={(e) => {
                                            setClearKey(e.target.checked);
                                            if (e.target.checked) setOpenAiKey('');
                                        }}
                                    />
                                    Remove saved OpenAI key
                                </label>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default AiSettings;

