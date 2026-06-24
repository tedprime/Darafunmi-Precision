import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import { confirmDialog } from "../../components/common/confirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  TriangleAlert,
  FolderOpen,
  Loader2,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/categories";

interface Category {
  id: number;
  name: string;
  status: "active" | "inactive" | string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getCategories({ search })
      .then(({ data }) => {
        setCategories(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  // Auto-focus add input when modal opens
  useEffect(() => {
    if (addOpen) setTimeout(() => addInputRef.current?.focus(), 80);
  }, [addOpen]);

  // Auto-focus edit input when modal opens
  useEffect(() => {
    if (editOpen) setTimeout(() => editInputRef.current?.focus(), 80);
  }, [editOpen]);

  const openAdd = () => {
    setNewName("");
    setNewStatus("active");
    setAddError(null);
    setAddOpen(true);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await createCategory({ name: newName.trim(), status: newStatus });
      setCategories((prev) => [...prev, res.data]);
      setAddOpen(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setEditName(cat.name);
    setEditStatus(cat.status);
    setEditError(null);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editTarget || !editName.trim()) return;
    setSaving(true);
    setEditError(null);
    try {
      await updateCategory(editTarget.id, { name: editName.trim(), status: editStatus });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? { ...c, name: editName.trim(), status: editStatus }
            : c,
        ),
      );
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !(await confirmDialog({
        title: "Delete category?",
        description: `Delete "${name}"? This cannot be undone.`,
        confirmLabel: "Delete",
      }))
    )
      return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = categories.filter((c) => c.status === "active").length;

  return (
    <Layout
      pageTitle="Categories"
      pageSubtitle="Manage product categories."
      action={
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Category
        </button>
      }
    >
      {/* Stats strip */}
      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 max-sm:hidden">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Inactive</p>
            <p className="text-2xl font-bold text-gray-400">{categories.length - activeCount}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${i < 5 ? "border-b border-gray-50" : ""}`}
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <TriangleAlert className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-gray-800 font-semibold">Failed to load categories</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category list */}
      {!loading && !error && (
        categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">
              {search ? "No categories match your search" : "No categories yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "Add your first category to get started"}
            </p>
            {!search && (
              <button
                onClick={openAdd}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} />
                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className={`group flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors ${
                  index < categories.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                  <div className="mt-1">
                    <Badge color={cat.status === "active" ? "green" : "gray"}>
                      {cat.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    disabled={deletingId === cat.id}
                    title="Edit"
                    className="p-1.5 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    title="Delete"
                    className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Add Category Modal ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!adding) setAddOpen(open); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Category name <span className="text-red-500">*</span>
              </label>
              <input
                ref={addInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Electronics"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-lg focus:ring-blue-500/20 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {addError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {addError}
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setAddOpen(false)}
              disabled={adding}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {adding && <Loader2 size={14} className="animate-spin" />}
              {adding ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Category Modal ── */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!saving) setEditOpen(open); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Category name <span className="text-red-500">*</span>
              </label>
              <input
                ref={editInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Category name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-lg focus:ring-blue-500/20 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {editError}
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editName.trim()}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CategoriesPage;
