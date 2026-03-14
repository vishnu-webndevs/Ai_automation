import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { activateAiPromptVersion, createAiPrompt, deleteAiPrompt, getAiPrompt, listAiPrompts, updateAiPrompt } from '../api';
import type { AiPrompt, AiPromptVersion } from '../types';

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const normalizePrompt = (raw: any): AiPrompt => {
  const prompt: AiPrompt = raw?.prompt ? raw.prompt : raw;
  const detectedVariables: string[] = raw?.detected_variables || [];
  const currentVersion = prompt.currentVersion || prompt.current_version || prompt.current_version_id ? (prompt.currentVersion || prompt.current_version) : null;

  return {
    ...prompt,
    variables_json: prompt.variables_json || detectedVariables || null,
    currentVersion: currentVersion || null,
  } as AiPrompt;
};

const AiPromptManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AiPrompt[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiPrompt | null>(null);
  const [versions, setVersions] = useState<AiPromptVersion[]>([]);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formPromptText, setFormPromptText] = useState('');

  const resetForm = useCallback(() => {
    setFormKey('');
    setFormName('');
    setFormDescription('');
    setFormActive(true);
    setFormPromptText('');
    setVersions([]);
    setDetectedVariables([]);
    setEditing(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(async (id: number) => {
    setSaving(false);
    setError(null);
    setModalOpen(true);
    try {
      const res = await getAiPrompt(id);
      const normalized = normalizePrompt(res.data);
      setEditing(normalized);
      setVersions(normalized.versions || []);
      setDetectedVariables((res.data?.detected_variables as string[]) || normalized.variables_json || []);
      setFormKey(normalized.key);
      setFormName(normalized.name);
      setFormDescription(normalized.description || '');
      setFormActive(!!normalized.is_active);
      const currentText = (normalized.currentVersion as any)?.prompt_text || (normalized.currentVersion as any)?.promptText || '';
      setFormPromptText(currentText);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load prompt');
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAiPrompts({ q: q || undefined, per_page: 20, page });
      const payload: Paginated<AiPrompt> = res.data;
      const normalized = (payload.data || []).map((item: any) => normalizePrompt(item));
      setRows(normalized);
      setTotalPages(payload.last_page || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(async () => {
    if (!formName.trim() || !formPromptText.trim() || (!editing && !formKey.trim())) {
      setError('Key, name, and prompt text are required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateAiPrompt(editing.id, {
          name: formName.trim(),
          description: formDescription.trim() || null,
          is_active: formActive,
          prompt_text: formPromptText,
        });
      } else {
        await createAiPrompt({
          key: formKey.trim(),
          name: formName.trim(),
          description: formDescription.trim() || null,
          is_active: formActive,
          prompt_text: formPromptText,
        });
      }
      setModalOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  }, [editing, formKey, formActive, formDescription, formName, formPromptText, load, resetForm]);

  const remove = useCallback(
    async (id: number) => {
      if (!window.confirm('Delete this prompt?')) return;
      setError(null);
      try {
        await deleteAiPrompt(id);
        await load();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to delete prompt');
      }
    },
    [load]
  );

  const activateVersion = useCallback(
    async (promptId: number, versionId: number) => {
      setSaving(true);
      setError(null);
      try {
        await activateAiPromptVersion(promptId, versionId);
        await openEdit(promptId);
        await load();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to activate version');
      } finally {
        setSaving(false);
      }
    },
    [load, openEdit]
  );

  const currentVersionId = useMemo(() => {
    if (!editing) return null;
    return editing.current_version_id || (editing.currentVersion as any)?.id || (editing.current_version as any)?.id || null;
  }, [editing]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Prompt Settings</h2>
          <p className="text-slate-500">Manage prompts for AI content generation without code changes.</p>
        </div>
        <Button onClick={openCreate} className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Prompt
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <Input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search by key or name" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="light" outline onClick={() => { setPage(1); load(); }}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading prompts...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No prompts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2 pr-4">Key</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Current Version</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const current = (row.currentVersion as any)?.version_number || (row.current_version as any)?.version_number || null;
                    return (
                      <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="py-3 pr-4 font-mono text-xs text-slate-700 dark:text-slate-200">{row.key}</td>
                        <td className="py-3 pr-4 text-slate-800 dark:text-white">{row.name}</td>
                        <td className="py-3 pr-4">
                          {row.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="text-slate-500">Disabled</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-200">{current ? `v${current}` : '—'}</td>
                        <td className="py-3 pr-4 text-slate-500">{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Button variant="light" outline onClick={() => openEdit(row.id)} className="inline-flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button variant="danger" onClick={() => remove(row.id)} className="inline-flex items-center gap-1">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="light" outline disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="light" outline disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editing ? 'Edit Prompt' : 'Add Prompt'}>
        <div className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Key</label>
              <Input value={formKey} onChange={(e: any) => setFormKey(e.target.value)} placeholder="e.g., service_page, blog_post, landing_page" />
              <p className="mt-1 text-xs text-slate-500">Use a stable identifier for the content type/post type.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Name</label>
            <Input value={formName} onChange={(e: any) => setFormName(e.target.value)} placeholder="Service Page Prompt" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</label>
            <Input value={formDescription} onChange={(e: any) => setFormDescription(e.target.value)} placeholder="Optional" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
            <span className="text-sm text-slate-700 dark:text-slate-200">Active</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Prompt Text</label>
            <textarea
              value={formPromptText}
              onChange={(e) => setFormPromptText(e.target.value)}
              className="w-full min-h-[260px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
              placeholder="Paste your prompt here..."
            />
          </div>

          {(detectedVariables.length > 0) && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Detected variables</div>
              <div className="flex flex-wrap gap-2">
                {detectedVariables.map((v) => (
                  <span key={v} className="inline-flex items-center rounded-full bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-mono text-slate-700 dark:text-slate-200">
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {editing && versions.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Versions</div>
                <div className="text-xs text-slate-500">Activating a version applies immediately to future generations</div>
              </div>
              <div className="mt-3 space-y-2">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div className="text-sm text-slate-800 dark:text-white">v{v.version_number}</div>
                      <div className="text-xs text-slate-500">{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</div>
                    </div>
                    {currentVersionId === v.id ? (
                      <span className="text-xs text-emerald-600">Current</span>
                    ) : (
                      <Button variant="light" outline disabled={saving} onClick={() => activateVersion(editing.id, v.id)}>
                        Activate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="light" outline onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AiPromptManager;
