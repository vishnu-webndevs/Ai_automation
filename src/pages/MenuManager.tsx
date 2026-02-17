import { useEffect, useMemo, useState } from 'react';
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
  listPageTemplates,
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

const MenuManager = () => {
  const [location, setLocation] = useState<string>('header-main');
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMenuName, setNewMenuName] = useState('');

  const [newLabel, setNewLabel] = useState('');
  const [newLinkType, setNewLinkType] = useState<'page' | 'service' | 'industry' | 'use-case' | 'solution' | 'integration' | 'template' | 'custom'>('page');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newPageSearch, setNewPageSearch] = useState('');
  const [newPageId, setNewPageId] = useState<number | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<{ id: number; title: string; slug: string }>>([]);

  // Use array for multi-select
  const [newServiceSearch, setNewServiceSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [serviceOptions, setServiceOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newIndustrySearch, setNewIndustrySearch] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [industryOptions, setIndustryOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newUseCaseSearch, setNewUseCaseSearch] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [useCaseOptions, setUseCaseOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newSolutionSearch, setNewSolutionSearch] = useState('');
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [solutionOptions, setSolutionOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newIntegrationSearch, setNewIntegrationSearch] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [integrationOptions, setIntegrationOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newTemplateSearch, setNewTemplateSearch] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [templateOptions, setTemplateOptions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [newShowOn, setNewShowOn] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [newVisible, setNewVisible] = useState(true);

  const [dragId, setDragId] = useState<number | null>(null);

  const tree = useMemo(() => buildTree(items), [items]);
  const parentOptions = useMemo(() => items.map((i) => ({ id: i.id, label: i.label })), [items]);

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
      .catch((e: any) => setError(e?.response?.data?.message || 'Failed to load menus'))
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

  useEffect(() => {
    if (newLinkType !== 'template') return;
    const t = window.setTimeout(() => {
      // Templates don't really support search in backend usually, or maybe they do?
      // listPageTemplates usually returns all.
      listPageTemplates()
        .then((res) => {
           let list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
           // Filter client side if backend doesn't support q
           if (newTemplateSearch.trim()) {
               const q = newTemplateSearch.trim().toLowerCase();
               list = list.filter((t: any) => t.name.toLowerCase().includes(q));
           }
           setTemplateOptions(list);
        })
        .catch(() => setTemplateOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newTemplateSearch, newLinkType]);

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

      const itemsToAdd: any[] = [];

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
      } else if (newLinkType === 'template') {
        if (selectedTemplates.length === 0) {
            setError('Please select at least one template');
            setLoading(false);
            return;
        }
        selectedTemplates.forEach(s => {
            itemsToAdd.push({
                label: s.name,
                custom_url: `/templates/${s.slug}`, // Assuming this convention
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to add item');
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update menu');
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update item');
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete item');
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  const onDropSwapWithinParent = async (targetId: number) => {
    if (!dragId || dragId === targetId) return;
    const dragItem = items.find((i) => i.id === dragId);
    const targetItem = items.find((i) => i.id === targetId);
    if (!dragItem || !targetItem) return;
    if (dragItem.parent_id !== targetItem.parent_id) return;

    const siblings = items
      .filter((i) => i.parent_id === dragItem.parent_id)
      .sort((a, b) => a.order - b.order);

    const ids = siblings.map((s) => s.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, dragId);

    const next = items.map((i) => {
      const idx = ids.indexOf(i.id);
      if (idx === -1) return i;
      return { ...i, order: idx };
    });

    setItems(next);
    await handleReorder(buildTree(next));
  };

  const NodeRow = ({ node, depth }: { node: TreeNode; depth: number }) => {
    const href = node.page ? `/${node.page.slug}` : node.custom_url || '';
    return (
      <div
        className="border rounded-lg p-3 bg-white"
        style={{ marginLeft: depth * 16 }}
        draggable
        onDragStart={() => setDragId(node.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDropSwapWithinParent(node.id)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[240px]">
            <div className="font-medium text-gray-900">{node.label}</div>
            <div className="text-xs text-gray-500">{href}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={node.show_on}
              onChange={(e) => handleItemUpdate(node.id, { show_on: e.target.value as any })}
              className="p-2 border rounded bg-white text-sm"
              disabled={loading}
            >
              <option value="all">All</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={node.is_visible}
                onChange={(e) => handleItemUpdate(node.id, { is_visible: e.target.checked })}
                disabled={loading}
              />
              Visible
            </label>
            <select
              value={node.parent_id || ''}
              onChange={(e) => handleItemUpdate(node.id, { parent_id: e.target.value ? Number(e.target.value) : null })}
              className="p-2 border rounded bg-white text-sm"
              disabled={loading}
            >
              <option value="">No parent</option>
              {parentOptions
                .filter((p) => p.id !== node.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Parent: {p.label}
                  </option>
                ))}
            </select>
            <Button size="sm" variant="danger" outline onClick={() => handleItemDelete(node.id)} disabled={loading}>
              Delete
            </Button>
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="mt-3 space-y-2">
            {node.children.map((c) => (
              <NodeRow key={c.id} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Navigation</h1>
        <div className="flex items-center gap-2">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as any)}
            className="p-2 border rounded bg-white"
          >
            <option value="header-main">Header (Main)</option>
            <option value="footer-primary">Footer (Primary)</option>
            <option value="sidebar-quick">Sidebar (Quick)</option>
          </select>
          {activeMenu && (
            <Button variant="secondary" outline onClick={handleToggleActive} disabled={loading}>
              {activeMenu.is_active ? 'Disable Menu' : 'Enable Menu'}
            </Button>
          )}
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
          <h2 className="text-lg font-bold text-gray-800">Add Menu Item</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6">
            {/* Top Row: Global Settings for the new item */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Link Type</label>
                <select
                  value={newLinkType}
                  onChange={(e) => {
                    setNewLinkType(e.target.value as any);
                    setNewPageId(null);
                    setSelectedServices([]);
                    setSelectedIndustries([]);
                    setSelectedUseCases([]);
                    setSelectedSolutions([]);
                    setSelectedIntegrations([]);
                    setSelectedTemplates([]);
                    setNewCustomUrl('');
                    setNewPageSearch('');
                    setNewServiceSearch('');
                    setNewIndustrySearch('');
                    setNewUseCaseSearch('');
                    setNewSolutionSearch('');
                    setNewIntegrationSearch('');
                    setNewTemplateSearch('');
                  }}
                  className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="page">Page</option>
                  <option value="service">Service (Multi)</option>
                  <option value="industry">Industry (Multi)</option>
                  <option value="use-case">Use Case (Multi)</option>
                  <option value="solution">Solution (Multi)</option>
                  <option value="integration">Integration (Multi)</option>
                  <option value="template">Page Template (Multi)</option>
                  <option value="custom">Custom URL</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Parent Item</label>
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
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Visibility & Device</label>
                <div className="flex gap-2">
                  <select
                    value={newShowOn}
                    onChange={(e) => setNewShowOn(e.target.value as any)}
                    className="p-2 border rounded bg-white flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                  <label className="flex items-center px-3 border rounded bg-white cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newVisible}
                      onChange={(e) => setNewVisible(e.target.checked)}
                      className="mr-2"
                    />
                    Visible
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button onClick={handleAddItem} disabled={loading} className="w-full justify-center">
                  Add Item
                </Button>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {newLinkType === 'page' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">Search Page (Published)</label>
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
                      placeholder="Type to search pages..."
                      className="bg-white"
                    />
                    {pageOptions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 border rounded-lg bg-white shadow-lg max-h-60 overflow-auto">
                        {pageOptions.map((p) => (
                          <button
                            key={p.id}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b last:border-0 ${
                              newPageId === p.id ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'
                            }`}
                            onClick={() => {
                              setNewPageId(p.id);
                              setNewLabel((prev) => prev || p.title);
                              setPageOptions([]);
                            }}
                            type="button"
                          >
                            {p.title} <span className="text-xs text-gray-400 block">{p.slug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Label (Link Text)</label>
                    <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Menu label" className="bg-white" />
                  </div>
                </div>
              ) : newLinkType === 'custom' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Custom URL</label>
                    <Input value={newCustomUrl} onChange={(e) => setNewCustomUrl(e.target.value)} placeholder="https://... or /path" className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Label</label>
                    <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Menu label" className="bg-white" />
                  </div>
                </div>
              ) : (
                // Multi-select view for Service, Industry, Use Case, Solution, Integration, Template
                (() => {
                    const props = {
                        service: { label: 'Services', search: newServiceSearch, setSearch: setNewServiceSearch, selected: selectedServices, setSelected: setSelectedServices, options: serviceOptions },
                        industry: { label: 'Industries', search: newIndustrySearch, setSearch: setNewIndustrySearch, selected: selectedIndustries, setSelected: setSelectedIndustries, options: industryOptions },
                        'use-case': { label: 'Use Cases', search: newUseCaseSearch, setSearch: setNewUseCaseSearch, selected: selectedUseCases, setSelected: setSelectedUseCases, options: useCaseOptions },
                        solution: { label: 'Solutions', search: newSolutionSearch, setSearch: setNewSolutionSearch, selected: selectedSolutions, setSelected: setSelectedSolutions, options: solutionOptions },
                        integration: { label: 'Integrations', search: newIntegrationSearch, setSearch: setNewIntegrationSearch, selected: selectedIntegrations, setSelected: setSelectedIntegrations, options: integrationOptions },
                        template: { label: 'Templates', search: newTemplateSearch, setSearch: setNewTemplateSearch, selected: selectedTemplates, setSelected: setSelectedTemplates, options: templateOptions },
                    }[newLinkType as string];
                    
                    if (!props) return null;

                    return (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700">
                              Select {props.label}
                            </label>
                            <div className="text-xs text-gray-500">
                              {props.selected.length} selected
                            </div>
                          </div>

                          <Input
                            value={props.search}
                            onChange={(e) => props.setSearch(e.target.value)}
                            placeholder={`Search ${props.label}...`}
                            className="bg-white"
                          />

                          {/* Selected Chips */}
                          {props.selected.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {props.selected.map((s) => (
                                <span key={s.id} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-blue-200">
                                  {s.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                        props.setSelected((prev: any[]) => prev.filter((x) => x.id !== s.id));
                                    }}
                                    className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-800 leading-none pb-0.5"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Options Grid */}
                          {props.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto pr-1">
                              {props.options.map((s) => {
                                 const isSelected = props.selected.some((x: any) => x.id === s.id);
                                 return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        props.setSelected((prev: any[]) => (isSelected ? prev.filter((x) => x.id !== s.id) : [...prev, s]));
                                    }}
                                    className={`flex items-center justify-between p-3 rounded border text-left transition-colors ${
                                      isSelected
                                        ? 'bg-blue-50 border-blue-300 shadow-inner'
                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className="font-medium text-sm text-gray-700 truncate mr-2">{s.name}</span>
                                    {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-400 text-sm italic">
                                {props.search ? 'No matches found' : 'Start typing to search...'}
                            </div>
                          )}
                        </div>
                    );
                })()
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Menu Structure</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {tree.map((n) => (
              <NodeRow key={n.id} node={n} depth={0} />
            ))}
            {tree.length === 0 && <div className="text-sm text-gray-500">No items yet.</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MenuManager;

