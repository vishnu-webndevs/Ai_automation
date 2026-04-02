import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import {
  addMenuItem,
  createMenu,
  deleteMenuItem,
  listMenuItems,
  listMenus,
  listPages,
  listServices,
  listIndustries,
  listUseCases,
  listSolutions,
  listIntegrations,
  reorderMenuItems,
  updateMenu,
  updateMenuItem,
} from '../api';

type Menu = {
  id: number;
  name: string;
  slug: string;
  location: string;
  is_active: boolean;
};

type MenuItem = {
  id: number;
  menu_id: number;
  parent_id: number | null;
  label: string;
  page_id: number | null;
  custom_url: string | null;
  show_on: 'all' | 'desktop' | 'mobile';
  is_visible: boolean;
  order: number;
  page?: { id: number; title: string; slug: string };
};

type TreeNode = MenuItem & { children: TreeNode[] };

type LinkType = 'page' | 'service' | 'industry' | 'use-case' | 'solution' | 'integration' | 'custom';
type MultiSelectOption = { id: number; name: string; slug: string };

type NewMenuItemPayload = {
  label: string;
  page_id?: number | null;
  custom_url?: string | null;
  parent_id: number | null;
  show_on: MenuItem['show_on'];
  is_visible: boolean;
};

const buildTree = (items: MenuItem[]): TreeNode[] => {
  const byId = new Map<number, TreeNode>();
  items.forEach((i) => byId.set(i.id, { ...i, children: [] }));

  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
};

const flattenForReorder = (nodes: TreeNode[], parentId: number | null = null): Array<{ id: number; parent_id: number | null; order: number }> => {
  const out: Array<{ id: number; parent_id: number | null; order: number }> = [];
  nodes.forEach((n, idx) => {
    out.push({ id: n.id, parent_id: parentId, order: idx });
    out.push(...flattenForReorder(n.children, n.id));
  });
  return out;
};

const cloneTree = (nodes: TreeNode[]): TreeNode[] => nodes.map((n) => ({ ...n, children: cloneTree(n.children) }));

const collectIds = (node: TreeNode): number[] => [node.id, ...node.children.flatMap(collectIds)];

const removeNodeById = (nodes: TreeNode[], id: number): { removed: TreeNode | null; next: TreeNode[] } => {
  let removed: TreeNode | null = null;

  const walk = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const n of list) {
      if (n.id === id) {
        removed = n;
        continue;
      }
      const nextChildren = walk(n.children);
      out.push(nextChildren === n.children ? n : { ...n, children: nextChildren });
    }
    return out;
  };

  const next = walk(nodes);
  return { removed, next };
};

type DropMode = 'before' | 'after' | 'inside';

const insertNode = (nodes: TreeNode[], targetId: number, mode: DropMode, node: TreeNode): TreeNode[] => {
  const walk = (list: TreeNode[]): TreeNode[] => {
    const idx = list.findIndex((n) => n.id === targetId);
    if (idx >= 0) {
      if (mode === 'inside') {
        return list.map((n) => (n.id === targetId ? { ...n, children: [...n.children, { ...node, parent_id: n.id }] } : n));
      }
      const before = mode === 'before';
      const next = list.slice();
      next.splice(before ? idx : idx + 1, 0, { ...node, parent_id: list[idx].parent_id ?? null });
      return next;
    }
    let changed = false;
    const mapped = list.map((n) => {
      const nextChildren = walk(n.children);
      if (nextChildren !== n.children) changed = true;
      return nextChildren === n.children ? n : { ...n, children: nextChildren };
    });
    return changed ? mapped : list;
  };

  return walk(nodes);
};

const getHref = (node: MenuItem) => {
  if (node.page) return `/${node.page.slug}`;
  return node.custom_url || '';
};

const getErrorMessage = (e: unknown) => {
  if (typeof e === 'object' && e !== null) {
    const maybeResponse = (e as { response?: { data?: { message?: unknown } } }).response;
    const msg = maybeResponse?.data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return 'Something went wrong';
};

const MenuManager = () => {
  const [location, setLocation] = useState<string>('header-main');
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMenuName, setNewMenuName] = useState('');

  const [newLabel, setNewLabel] = useState('');
  const [newLinkType, setNewLinkType] = useState<LinkType>('page');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newPageSearch, setNewPageSearch] = useState('');
  const [newPageId, setNewPageId] = useState<number | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<{ id: number; title: string; slug: string }>>([]);
  const pageDropdownRef = useRef<HTMLDivElement | null>(null);

  // Use array for multi-select
  const [newServiceSearch, setNewServiceSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState<MultiSelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<MultiSelectOption[]>([]);

  const [newIndustrySearch, setNewIndustrySearch] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<MultiSelectOption[]>([]);
  const [industryOptions, setIndustryOptions] = useState<MultiSelectOption[]>([]);

  const [newUseCaseSearch, setNewUseCaseSearch] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<MultiSelectOption[]>([]);
  const [useCaseOptions, setUseCaseOptions] = useState<MultiSelectOption[]>([]);

  const [newSolutionSearch, setNewSolutionSearch] = useState('');
  const [selectedSolutions, setSelectedSolutions] = useState<MultiSelectOption[]>([]);
  const [solutionOptions, setSolutionOptions] = useState<MultiSelectOption[]>([]);

  const [newIntegrationSearch, setNewIntegrationSearch] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<MultiSelectOption[]>([]);
  const [integrationOptions, setIntegrationOptions] = useState<MultiSelectOption[]>([]);

  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [newShowOn, setNewShowOn] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [newVisible, setNewVisible] = useState(true);

  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<{ id: number | null; mode: DropMode | null }>({ id: null, mode: null });
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [editingIds, setEditingIds] = useState<Record<number, boolean>>({});

  const tree = useMemo(() => buildTree(items), [items]);
  const parentOptions = useMemo(() => items.map((i) => ({ id: i.id, label: i.label })), [items]);
  const linkTypeChoices: Array<{ value: LinkType; label: string }> = [
    { value: 'page', label: 'Page' },
    { value: 'custom', label: 'Custom Link' },
    { value: 'service', label: 'Service' },
    { value: 'industry', label: 'Industry' },
    { value: 'use-case', label: 'Use Case' },
    { value: 'solution', label: 'Solution' },
    { value: 'integration', label: 'Integration' },
  ];

  const loadActiveMenu = async (loc: string) => {
    const res = await listMenus({ location: loc });
    const data = Array.isArray(res.data) ? res.data : res.data.data || [];
    const found = data[0] || null;
    setActiveMenu(found);
    if (!found) {
      setItems([]);
      return;
    }
    const itemsRes = await listMenuItems(found.id);
    setItems(Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data.data || []);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => loadActiveMenu(location))
      .catch((e: unknown) => setError(getErrorMessage(e) || 'Failed to load menus'))
      .finally(() => setLoading(false));
  }, [location]);

  useEffect(() => {
    if (newLinkType !== 'page') return;
    const t = window.setTimeout(() => {
      listPages({ q: newPageSearch.trim(), per_page: 20, status: 'published' })
        .then((res) => setPageOptions(res.data?.data || []))
        .catch(() => setPageOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newPageSearch, newLinkType]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!pageDropdownRef.current) return;
      if (e.target instanceof Node && pageDropdownRef.current.contains(e.target)) return;
      setPageOptions([]);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (newLinkType !== 'service') return;
    const t = window.setTimeout(() => {
      listServices({ q: newServiceSearch.trim(), per_page: 50 })
        .then((res) => {
           const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           setServiceOptions(list);
        })
        .catch(() => setServiceOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newServiceSearch, newLinkType]);

  useEffect(() => {
    if (newLinkType !== 'industry') return;
    const t = window.setTimeout(() => {
      listIndustries({ q: newIndustrySearch.trim(), per_page: 50 })
        .then((res) => {
           const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           setIndustryOptions(list);
        })
        .catch(() => setIndustryOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newIndustrySearch, newLinkType]);

  useEffect(() => {
    if (newLinkType !== 'use-case') return;
    const t = window.setTimeout(() => {
      listUseCases({ q: newUseCaseSearch.trim(), per_page: 50 })
        .then((res) => {
           const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           setUseCaseOptions(list);
        })
        .catch(() => setUseCaseOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newUseCaseSearch, newLinkType]);

  useEffect(() => {
    if (newLinkType !== 'solution') return;
    const t = window.setTimeout(() => {
      listSolutions({ q: newSolutionSearch.trim(), per_page: 50 })
        .then((res) => {
           const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           setSolutionOptions(list);
        })
        .catch(() => setSolutionOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newSolutionSearch, newLinkType]);

  useEffect(() => {
    if (newLinkType !== 'integration') return;
    const t = window.setTimeout(() => {
      listIntegrations({ q: newIntegrationSearch.trim(), per_page: 50 })
        .then((res) => {
           const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           setIntegrationOptions(list);
        })
        .catch(() => setIntegrationOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newIntegrationSearch, newLinkType]);

  const ensureMenu = async () => {
    if (activeMenu) return activeMenu;
    if (!newMenuName.trim()) {
      setError('Menu name is required');
      return null;
    }
    const created = await createMenu({ name: newMenuName.trim(), location });
    await loadActiveMenu(location);
    return created.data as Menu;
  };

  const handleAddItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const menu = await ensureMenu();
      if (!menu) return;

      const itemsToAdd: NewMenuItemPayload[] = [];

      if (newLinkType === 'page') {
         if (!newPageId && !newCustomUrl) { // Logic is weird here, let's fix
             // Page logic
             itemsToAdd.push({
                label: newLabel.trim(),
                page_id: newPageId,
                custom_url: null,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible,
             });
         }
         // Actually, let's keep it simple and just handle bulk for services/etc
         if (newPageId) {
             itemsToAdd.push({
                 label: newLabel.trim() || 'Page', // Should use page title ideally but we might not have it easily here if we cleared options.
                 page_id: newPageId,
                 parent_id: newParentId,
                 show_on: newShowOn,
                 is_visible: newVisible
             });
         }
      } else if (newLinkType === 'service') {
        if (selectedServices.length === 0) {
            setError('Please select at least one service');
            setLoading(false);
            return;
        }
        selectedServices.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/services/${s.slug}`,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible
            });
        });
      } else if (newLinkType === 'industry') {
        if (selectedIndustries.length === 0) {
            setError('Please select at least one industry');
            setLoading(false);
            return;
        }
        selectedIndustries.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/industries/${s.slug}`,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible
            });
        });
      } else if (newLinkType === 'use-case') {
        if (selectedUseCases.length === 0) {
            setError('Please select at least one use case');
            setLoading(false);
            return;
        }
        selectedUseCases.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/use-cases/${s.slug}`,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible
            });
        });
      } else if (newLinkType === 'solution') {
        if (selectedSolutions.length === 0) {
            setError('Please select at least one solution');
            setLoading(false);
            return;
        }
        selectedSolutions.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/solutions/${s.slug}`,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible
            });
        });
      } else if (newLinkType === 'integration') {
        if (selectedIntegrations.length === 0) {
            setError('Please select at least one integration');
            setLoading(false);
            return;
        }
        selectedIntegrations.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/integrations/${s.slug}`,
                parent_id: newParentId,
                show_on: newShowOn,
                is_visible: newVisible
            });
        });
      } else {
        // Custom
        itemsToAdd.push({
            label: newLabel.trim(),
            custom_url: newCustomUrl.trim(),
            parent_id: newParentId,
            show_on: newShowOn,
            is_visible: newVisible
        });
      }

      // Validation
      for (const item of itemsToAdd) {
          if (!item.label && !item.page_id) { // If page_id is there, label might be optional if backend handles it? usually backend needs label.
              // For services/etc we set label.
              // For custom, we check label.
              if (newLinkType === 'custom' && !item.label) {
                  setError('Label is required for custom links');
                  setLoading(false);
                  return;
              }
              // If page, ensure label
              if (newLinkType === 'page' && !item.label) {
                  setError('Label is required');
                  setLoading(false);
                  return;
              }
          }
      }

      // Add all
      for (const item of itemsToAdd) {
          await addMenuItem(menu.id, item);
      }

      await loadActiveMenu(location);
      
      // Reset
      setNewLabel('');
      setNewCustomUrl('');
      setNewPageId(null);
      setNewPageSearch('');
      setSelectedServices([]);
      setNewServiceSearch('');
      setSelectedIndustries([]);
      setNewIndustrySearch('');
      setSelectedUseCases([]);
      setNewUseCaseSearch('');
      
      // Keep parent and settings for easier bulk entry? Or reset?
      // Resetting is safer to avoid accidental wrong parent
      setNewParentId(null); 
      setNewShowOn('all');
      setNewVisible(true);
      } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!activeMenu) return;
    setLoading(true);
    setError(null);
    try {
      await updateMenu(activeMenu.id, { is_active: !activeMenu.is_active });
      await loadActiveMenu(location);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = async (id: number, patch: Partial<MenuItem>) => {
    if (!activeMenu) return;
    setLoading(true);
    setError(null);
    try {
      await updateMenuItem(id, patch);
      await loadActiveMenu(location);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleItemDelete = async (id: number) => {
    if (!activeMenu) return;
    setLoading(true);
    setError(null);
    try {
      await deleteMenuItem(id);
      await loadActiveMenu(location);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (nextTree: TreeNode[]) => {
    if (!activeMenu) return;
    setLoading(true);
    setError(null);
    try {
      const flat = flattenForReorder(nextTree);
      await reorderMenuItems(activeMenu.id, flat);
      await loadActiveMenu(location);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (targetId: number, mode: DropMode) => {
    if (!dragId || dragId === targetId) return;
    const nextTreeBase = cloneTree(tree);
    const { removed, next } = removeNodeById(nextTreeBase, dragId);
    if (!removed) return;
    const removedIds = new Set(collectIds(removed));
    if (removedIds.has(targetId)) return;

    const nextTree = insertNode(next, targetId, mode, removed);
    const flat = flattenForReorder(nextTree);
    const map = new Map(flat.map((f) => [f.id, f]));
    setItems((prev) =>
      prev.map((i) => {
        const f = map.get(i.id);
        if (!f) return i;
        return { ...i, parent_id: f.parent_id, order: f.order };
      })
    );

    await handleReorder(nextTree);
  };

  const TreeRow = ({ node, depth }: { node: TreeNode; depth: number }) => {
    const hasChildren = node.children.length > 0;
    const expanded = expandedIds[node.id] ?? true;
    const editing = editingIds[node.id] ?? false;
    const href = getHref(node);
    const isDragOver = dragOver.id === node.id;
    const dropMode = dragOver.mode;

    const descendantIds = useMemo(() => new Set(collectIds(node)), [node]);

    const deviceLabel = node.show_on === 'all' ? 'All devices' : node.show_on === 'desktop' ? 'Desktop' : 'Mobile';
    const visibilityLabel = node.is_visible ? 'Visible' : 'Hidden';

    return (
      <div className="relative">
        {depth > 0 && (
          <>
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            <div className="absolute left-3 top-5 w-4 h-px bg-gray-200" />
          </>
        )}

        <div
          className={[
            'group rounded-xl border bg-white px-4 py-3 transition-colors',
            'hover:border-gray-300 hover:bg-gray-50',
            isDragOver && dropMode === 'inside' ? 'border-blue-400 ring-2 ring-blue-100' : '',
            isDragOver && dropMode !== 'inside' ? 'border-blue-400' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ marginLeft: depth * 24 }}
          draggable
          onDragStart={() => setDragId(node.id)}
          onDragEnd={() => {
            setDragId(null);
            setDragOver({ id: null, mode: null });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const y = e.clientY - rect.top;
            const ratio = y / rect.height;
            const mode: DropMode = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
            setDragOver({ id: node.id, mode });
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!dragOver.mode) return;
            void handleDrop(node.id, dragOver.mode);
            setDragOver({ id: null, mode: null });
          }}
        >
          {isDragOver && dropMode !== 'inside' && (
            <div className={['absolute left-0 right-0', dropMode === 'before' ? '-top-1' : '-bottom-1'].join(' ')}>
              <div className="h-0.5 bg-blue-500 rounded-full" />
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="pt-0.5 text-gray-400 group-hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => setExpandedIds((prev) => ({ ...prev, [node.id]: !expanded }))}
                      className="text-gray-500 hover:text-gray-800"
                      aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <span className="w-4" />
                  )}
                  <div className="font-semibold text-gray-900 truncate">{node.label}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-white text-gray-600">{deviceLabel}</span>
                  <span
                    className={[
                      'text-xs px-2 py-0.5 rounded-full border',
                      node.is_visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200',
                    ].join(' ')}
                  >
                    {visibilityLabel}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">{href || '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingIds((prev) => ({ ...prev, [node.id]: !editing }))}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleItemDelete(node.id)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          {editing && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <Input
                  value={node.label}
                  onChange={(e) => handleItemUpdate(node.id, { label: e.target.value })}
                  disabled={loading}
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Device visibility</label>
                <select
                  value={node.show_on}
                  onChange={(e) => handleItemUpdate(node.id, { show_on: e.target.value as MenuItem['show_on'] })}
                  className="w-full p-2 border rounded bg-white text-sm"
                  disabled={loading}
                >
                  <option value="all">All devices</option>
                  <option value="desktop">Desktop only</option>
                  <option value="mobile">Mobile only</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enabled</label>
                <label className="flex items-center gap-2 px-3 py-2 border rounded bg-white text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={node.is_visible}
                    onChange={(e) => handleItemUpdate(node.id, { is_visible: e.target.checked })}
                    disabled={loading}
                  />
                  Show item
                </label>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                <select
                  value={node.parent_id || ''}
                  onChange={(e) => handleItemUpdate(node.id, { parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2 border rounded bg-white text-sm"
                  disabled={loading}
                >
                  <option value="">No parent (Root)</option>
                  {parentOptions
                    .filter((p) => !descendantIds.has(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">Tip: Drag & drop to change hierarchy faster.</div>
              </div>
            </div>
          )}
        </div>

        {hasChildren && expanded && (
          <div className="mt-2 space-y-2">
            {node.children.map((c) => (
              <TreeRow key={c.id} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <div className="text-sm text-gray-500 mt-1">Build clean navigation with drag-and-drop ordering and nesting.</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-2 border rounded bg-white"
              disabled={loading}
            >
              <option value="header-main">Header</option>
              <option value="footer">Footer (Manage all columns)</option>
              <option value="sidebar-quick">Mobile</option>
            </select>
            {activeMenu && (
              <Button variant={activeMenu.is_active ? 'secondary' : 'primary'} outline={!activeMenu.is_active} onClick={handleToggleActive} disabled={loading}>
                {activeMenu.is_active ? 'Disable' : 'Enable'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {!activeMenu && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-800">Create Menu</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Menu Name</label>
                <Input value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} placeholder="e.g. Primary Navigation" />
              </div>
              <div className="flex items-end">
                <Button onClick={ensureMenu} disabled={loading}>
                  Create
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6 overflow-visible">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Add Menu Item</h2>
              <div className="text-sm text-gray-500 mt-1">Step-by-step builder. You can always drag items later to reorder or nest.</div>
            </div>
            <Button onClick={handleAddItem} disabled={loading} className="justify-center">
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <div className="text-sm font-semibold text-gray-800 mb-2">Step 1 — Link type</div>
                <div className="grid grid-cols-2 gap-2">
                  {linkTypeChoices.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setNewLinkType(t.value);
                        setNewPageId(null);
                        setSelectedServices([]);
                        setSelectedIndustries([]);
                        setSelectedUseCases([]);
                        setSelectedSolutions([]);
                        setSelectedIntegrations([]);
                        setNewCustomUrl('');
                        setNewPageSearch('');
                        setNewServiceSearch('');
                        setNewIndustrySearch('');
                        setNewUseCaseSearch('');
                        setNewSolutionSearch('');
                        setNewIntegrationSearch('');
                      }}
                      className={[
                        'px-3 py-2 rounded-lg border text-sm font-medium text-left transition-colors',
                        newLinkType === t.value ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="text-sm font-semibold text-gray-800 mb-2">Step 2 — Choose destination</div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {newLinkType === 'page' ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4" ref={pageDropdownRef}>
                      <div className="md:col-span-7 relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Search Page</label>
                          {(newPageId || newPageSearch) && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewPageId(null);
                                setNewPageSearch('');
                                setPageOptions([]);
                              }}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <Input
                          value={newPageSearch}
                          onChange={(e) => setNewPageSearch(e.target.value)}
                          placeholder="Type to search published pages..."
                          className="bg-white"
                        />
                        {pageOptions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 border rounded-lg bg-white shadow-lg max-h-60 overflow-auto">
                            {pageOptions.map((p) => (
                              <button
                                key={p.id}
                                className={[
                                  'w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b last:border-0',
                                  newPageId === p.id ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700',
                                ].join(' ')}
                                onClick={() => {
                                  setNewPageId(p.id);
                                  setNewLabel((prev) => prev || p.title);
                                  setPageOptions([]);
                                }}
                                type="button"
                              >
                                <div className="font-medium">{p.title}</div>
                                <div className="text-xs text-gray-500">/{p.slug}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Menu label</label>
                        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Services" className="bg-white" />
                      </div>
                    </div>
                  ) : newLinkType === 'custom' ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-7">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <Input value={newCustomUrl} onChange={(e) => setNewCustomUrl(e.target.value)} placeholder="https://... or /path" className="bg-white" />
                      </div>
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Menu label</label>
                        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Contact" className="bg-white" />
                      </div>
                    </div>
                  ) : (
                    (() => {
                      type MultiProps = {
                        label: string;
                        search: string;
                        setSearch: (v: string) => void;
                        selected: MultiSelectOption[];
                        setSelected: React.Dispatch<React.SetStateAction<MultiSelectOption[]>>;
                        options: MultiSelectOption[];
                      };

                      const props: MultiProps | null =
                        newLinkType === 'service'
                          ? { label: 'Services', search: newServiceSearch, setSearch: setNewServiceSearch, selected: selectedServices, setSelected: setSelectedServices, options: serviceOptions }
                          : newLinkType === 'industry'
                            ? { label: 'Industries', search: newIndustrySearch, setSearch: setNewIndustrySearch, selected: selectedIndustries, setSelected: setSelectedIndustries, options: industryOptions }
                            : newLinkType === 'use-case'
                              ? { label: 'Use Cases', search: newUseCaseSearch, setSearch: setNewUseCaseSearch, selected: selectedUseCases, setSelected: setSelectedUseCases, options: useCaseOptions }
                              : newLinkType === 'solution'
                                ? { label: 'Solutions', search: newSolutionSearch, setSearch: setNewSolutionSearch, selected: selectedSolutions, setSelected: setSelectedSolutions, options: solutionOptions }
                                : newLinkType === 'integration'
                                  ? { label: 'Integrations', search: newIntegrationSearch, setSearch: setNewIntegrationSearch, selected: selectedIntegrations, setSelected: setSelectedIntegrations, options: integrationOptions }
                                  : null;

                      if (!props) return null;

                      return (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">Select {props.label}</div>
                            <div className="text-xs text-gray-500">{props.selected.length} selected</div>
                          </div>

                          <Input value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder={`Search ${props.label}...`} className="bg-white" />

                          {props.selected.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {props.selected.map((s) => (
                                <span key={s.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-blue-200">
                                  {s.name}
                                  <button
                                    type="button"
                                    onClick={() => props.setSelected((prev) => prev.filter((x) => x.id !== s.id))}
                                    className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-800 leading-none pb-0.5"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {props.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto pr-1">
                              {props.options.map((s) => {
                                const isSelected = props.selected.some((x) => x.id === s.id);
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => props.setSelected((prev) => (isSelected ? prev.filter((x) => x.id !== s.id) : [...prev, s]))}
                                    className={[
                                      'flex items-center justify-between p-3 rounded border text-left transition-colors',
                                      isSelected ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50',
                                    ].join(' ')}
                                  >
                                    <span className="font-medium text-sm text-gray-700 truncate mr-2">{s.name}</span>
                                    {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-400 text-sm italic">{props.search ? 'No matches found' : 'Start typing to search...'}</div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <div className="text-sm font-semibold text-gray-800 mb-2">Step 3 — Parent (optional)</div>
                <select
                  value={newParentId || ''}
                  onChange={(e) => setNewParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">No parent (Root)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">You can also drag items under a parent after adding.</div>
              </div>

              <div className="lg:col-span-6">
                <div className="text-sm font-semibold text-gray-800 mb-2">Step 4 — Visibility</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={newShowOn} onChange={(e) => setNewShowOn(e.target.value as MenuItem['show_on'])} className="p-2 border rounded bg-white flex-1">
                    <option value="all">All devices</option>
                    <option value="desktop">Desktop only</option>
                    <option value="mobile">Mobile only</option>
                  </select>
                  <label className="flex items-center px-3 border rounded bg-white cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={newVisible} onChange={(e) => setNewVisible(e.target.checked)} className="mr-2" />
                    Visible
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Menu Structure</h2>
              <div className="text-sm text-gray-500 mt-1">
                Drag to reorder. Drop in the middle of an item to nest it under that parent.
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {items.length} items
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {tree.map((n) => (
              <TreeRow key={n.id} node={n} depth={0} />
            ))}
            {tree.length === 0 && <div className="text-sm text-gray-500">No items yet.</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MenuManager;
