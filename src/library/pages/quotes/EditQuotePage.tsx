import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { getQuoteById, updateQuote } from "../../../services/quote.jsx";
import { getClients } from "../../../services/client.jsx";

interface Client {
  id: number;
  name: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditQuotePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quoteNumber, setQuoteNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getQuoteById(id), getClients({ limit: 100 })])
      .then(([quote, { data }]) => {
        setQuoteNumber(quote.quoteNumber ?? "");
        setClientId(quote.clientId ? String(quote.clientId) : "");
        setAmount(quote.amount !== undefined ? String(quote.amount) : "");
        setDate(quote.date ? quote.date.slice(0, 10) : "");
        setDescription(quote.description ?? "");
        setNotes(quote.notes ?? "");
        setStatus(quote.status ?? "pending");
        setClients(data);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quoteNumber.trim()) {
      setError("Quote number is required.");
      return;
    }

    setSubmitting(true);
    try {
      await updateQuote(id, {
        quoteNumber: quoteNumber.trim(),
        ...(clientId && { clientId: Number(clientId) }),
        ...(amount && { amount: Number(amount) }),
        ...(date && { date }),
        description: description.trim(),
        notes: notes.trim(),
        status,
      });
      navigate("/quotes");
    } catch {
      setError("Failed to update quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Quote" pageSubtitle="Update quote details">

      {/* Loading Skeleton */}
      {loading && (
        <Card className="mb-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex space-x-4 mt-6">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
          </div>
        </Card>
      )}

      {/* Load Error State */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-700 font-medium">Failed to load quote</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Edit Form */}
      {!loading && !loadError && (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quote Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Input
                  id="quoteNumber"
                  label="Quote Number"
                  placeholder="e.g., QT-2025-001"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                />

                <div>
                  <label
                    htmlFor="client"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Client
                  </label>
                  <select
                    id="client"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  id="amount"
                  label="Amount"
                  placeholder="Enter amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                  id="date"
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter quote description"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter any additional notes"
                />
              </div>
            </Card>

            <div className="flex space-x-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/quotes")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </>
      )}
    </Layout>
  );
};

export default EditQuotePage;