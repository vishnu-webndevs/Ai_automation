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
  const [newLinkType, setNewLinkType] = useState<'page' | 'custom'>('page');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newPageSearch, setNewPageSearch] = useState('');
  const [newPageId, setNewPageId] = useState<number | null>(null);
  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [newShowOn, setNewShowOn] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [newVisible, setNewVisible] = useState(true);

  const [pageOptions, setPageOptions] = useState<Array<{ id: number; title: string; slug: string }>>([]);

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
    const t = window.setTimeout(() => {
      if (!newPageSearch.trim()) {
        setPageOptions([]);
        return;
      }
      listPages({ q: newPageSearch.trim(), per_page: 10 })
        .then((res) => setPageOptions(res.data?.data || []))
        .catch(() => setPageOptions([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [newPageSearch]);

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

      const payload: any = {
        label: newLabel.trim(),
        parent_id: newParentId,
        show_on: newShowOn,
        is_visible: newVisible,
      };

      if (newLinkType === 'page') {
        payload.page_id = newPageId;
      } else {
        payload.custom_url = newCustomUrl.trim();
      }

      if (!payload.label) {
        setError('Label is required');
        return;
      }

      await addMenuItem(menu.id, payload);
      await loadActiveMenu(location);
      setNewLabel('');
      setNewCustomUrl('');
      setNewPageId(null);
      setNewPageSearch('');
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

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Add Menu Item</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Services" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link Type</label>
              <select
                value={newLinkType}
                onChange={(e) => {
                  setNewLinkType(e.target.value as any);
                  setNewPageId(null);
                  setNewCustomUrl('');
                }}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="page">Page</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>
            <div>
              {newLinkType === 'page' ? (
                <>
                  <label className="block text-sm font-medium mb-1">Page Search</label>
                  <Input value={newPageSearch} onChange={(e) => setNewPageSearch(e.target.value)} placeholder="Search pages..." />
                  {pageOptions.length > 0 && (
                    <div className="mt-2 border rounded bg-white max-h-40 overflow-auto">
                      {pageOptions.map((p) => (
                        <button
                          key={p.id}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            newPageId === p.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            setNewPageId(p.id);
                            setNewLabel((prev) => prev || p.title);
                          }}
                          type="button"
                        >
                          {p.title} <span className="text-xs text-gray-500">/{p.slug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {newPageId && <div className="text-xs text-gray-500 mt-1">Selected page ID: {newPageId}</div>}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium mb-1">Custom URL</label>
                  <Input value={newCustomUrl} onChange={(e) => setNewCustomUrl(e.target.value)} placeholder="/contact or https://..." />
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent</label>
              <select
                value={newParentId || ''}
                onChange={(e) => setNewParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="">No parent</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">Drag-and-drop reorders within the same parent.</div>
            </div>
            <div className="flex items-end gap-2">
              <select
                value={newShowOn}
                onChange={(e) => setNewShowOn(e.target.value as any)}
                className="p-2 border rounded bg-white"
              >
                <option value="all">All</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={newVisible} onChange={(e) => setNewVisible(e.target.checked)} />
                Visible
              </label>
              <Button onClick={handleAddItem} disabled={loading}>
                Add
              </Button>
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

