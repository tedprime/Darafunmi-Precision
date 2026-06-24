import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Search, Trash2, Edit2, TriangleAlert, X, Loader2, Save } from "lucide-react";
import { getClients, deleteClient, createClient, updateClient, getClientById } from "../../../services/client.jsx";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive" | string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ClientListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [modalClientId, setModalClientId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, count } = await getClients({ search, status });
      setClients(data);
      setCount(count);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, status]);

  const resetClientForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormLocation("");
    setFormAddress("");
    setFormStatus("active");
    setModalError(null);
  };

  const closeClientModal = () => {
    setModalMode(null);
    setModalClientId(null);
    resetClientForm();
  };

  const openAddClientModal = () => {
    resetClientForm();
    setModalMode("add");
    setModalClientId(null);
  };

  const openEditClientModal = async (client: Client) => {
    setModalMode("edit");
    setModalClientId(client.id);
    setModalLoading(true);
    setModalError(null);

    try {
      const res = await getClientById(client.id);
      const existing = res.data ?? {};
      setFormName(existing.name ?? client.name ?? "");
      setFormEmail(existing.email ?? client.email ?? "");
      setFormPhone(existing.phone ?? client.phone ?? "");
      setFormLocation(existing.location ?? client.location ?? "");
      setFormAddress(existing.address ?? "");
      setFormStatus(existing.status ?? (client.status as "active" | "inactive") ?? "active");
    } catch (err: any) {
      setModalError(err?.message || "Failed to load client details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleClientSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setModalError(null);

    if (!formName.trim()) {
      setModalError("Client name is required.");
      return;
    }

    setModalSubmitting(true);
    try {
      if (modalMode === "add") {
        await createClient({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          location: formLocation.trim(),
          address: formAddress.trim(),
          status: formStatus,
        });
      } else if (modalMode === "edit" && modalClientId !== null) {
        await updateClient(modalClientId, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          location: formLocation.trim(),
          address: formAddress.trim(),
          status: formStatus,
        });
      }

      await loadClients();
      closeClientModal();
    } catch {
      setModalError(`Failed to ${modalMode === "add" ? "create" : "update"} client. Please try again.`);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDialog({
      title: "Delete client?",
      description: `Delete client "${name}"?`,
      confirmLabel: "Delete",
    }))) return;
    try {
      setDeletingId(id);
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete client.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout
      pageTitle="Clients"
      pageSubtitle={`Manage all your clients and their information here.${count ? ` (${count} total)` : ""}`}
      action={
        <Button onClick={openAddClientModal}>
          <Plus size={16} /> Add Client
        </Button>
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
            placeholder="Search by name or email..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load clients</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !error && (
        <>
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Clients</h3>
            </div>
            {clients.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No clients found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Name", "Email", "Phone", "Location", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal wrap-break-word">{client.name}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal wrap-break-word">{client.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal wrap-break-word">{client.phone}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal wrap-break-word">{client.location}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={client.status === "active" ? "green" : "gray"}>{client.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => openEditClientModal(client)}
                            disabled={deletingId === client.id}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(client.id, client.name)}
                            disabled={deletingId === client.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {clients.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No clients found.</p>
            ) : clients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 wrap-break-word">{client.name}</p>
                    <p className="text-xs text-gray-500 wrap-break-word mt-0.5">{client.email}</p>
                  </div>
                  <Badge color={client.status === "active" ? "green" : "gray"}>{client.status}</Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  {client.phone && <p>{client.phone}</p>}
                  {client.location && <p>{client.location}</p>}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => openEditClientModal(client)}
                    disabled={deletingId === client.id}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => handleDelete(client.id, client.name)}
                    disabled={deletingId === client.id}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {modalMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40" onClick={closeClientModal} />
              <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {modalMode === "add" ? "Add Client" : "Edit Client"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {modalMode === "add"
                        ? "Create a new client profile."
                        : "Update the selected client information."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeClientModal}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-[78vh] overflow-y-auto p-5">
                  {modalLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i}>
                            <div className="h-3.5 w-24 mb-2 rounded-full bg-gray-200 animate-pulse" />
                            <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <div className="h-3.5 w-24 mb-2 rounded-full bg-gray-200 animate-pulse" />
                          <div className="h-24 w-full rounded-xl bg-gray-200 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleClientSubmit} className="space-y-4">
                      {modalError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                          <TriangleAlert size={16} className="shrink-0" />
                          {modalError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
                          <input
                            type="text"
                            placeholder="Enter client name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                          <input
                            type="text"
                            placeholder="Enter phone number"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                          <input
                            type="text"
                            placeholder="Enter location"
                            value={formLocation}
                            onChange={(e) => setFormLocation(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                          <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value as "active" | "inactive")}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors appearance-none"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                          <textarea
                            rows={3}
                            value={formAddress}
                            onChange={(e) => setFormAddress(e.target.value)}
                            placeholder="Enter full address"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400 resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={closeClientModal}
                          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={modalSubmitting}
                          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {modalSubmitting ? (
                            <><Loader2 size={15} className="animate-spin" />Saving...</>
                          ) : (
                            <><Save size={15} />{modalMode === "add" ? "Save Client" : "Save Changes"}</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default ClientListPage;
