import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search, X, Check } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../../services/categories";

interface Category {
  id: number;
  name: string;
  status: "active" | "inactive" | string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [adding, setAdding] = useState(false);

  // Edit inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getCategories({ search })
      .then(({ data }) => {
        setCategories(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await createCategory({ name: newName.trim(), status: newStatus });
      setCategories((prev) => [...prev, res.data]);
      setNewName("");
      setNewStatus("active");
      setShowAdd(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditStatus(cat.status);
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      await updateCategory(id, { name: editName.trim(), status: editStatus });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editName.trim(), status: editStatus } : c))
      );
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout
      pageTitle="Categories"
      pageSubtitle="Manage product categories."
      action={
        <Button className="flex items-center" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" /> Add Category
        </Button>
      }
    >
      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search categories..."
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading categories...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Add form */}
      {showAdd && (
        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">New Category</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
                {adding ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => { setShowAdd(false); setNewName(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Category list */}
      {!loading && !error && (
        <Card>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No categories found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-3 px-1">
                  {editingId === cat.id ? (
                    <div className="flex flex-1 items-center gap-3 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                      <Badge color={cat.status === "active" ? "green" : "gray"}>
                        {cat.status}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleSave(cat.id)}
                          disabled={saving}
                          className="p-1 border border-green-200 rounded text-green-600 hover:bg-green-50 disabled:opacity-40"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          disabled={deletingId === cat.id}
                          className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
};

export default CategoriesPage;

