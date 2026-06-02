import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { createQuote } from "../../../services/quote.jsx";
import { getClients } from "../../../services/client.jsx";

interface Client { id: number; name: string; }

const AddQuotePage: React.FC = () => {
  const navigate = useNavigate();

  const [quoteNumber, setQuoteNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClients({ limit: 100 })
      .then(({ data }) => setClients(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!quoteNumber.trim()) {
      setError("Quote number is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createQuote({
        quoteNumber: quoteNumber.trim(),
        ...(clientId && { clientId: Number(clientId) }),
        ...(amount && { amount: Number(amount) }),
        ...(date && { date }),
        description: description.trim(),
        notes: notes.trim(),
        status,
      });
      navigate("/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Quote" pageSubtitle="Create a new quotation">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quote Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input id="quoteNumber" label="Quote Number" placeholder="e.g., QT-2025-001"
              value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input id="amount" label="Amount" placeholder="Enter amount" type="number"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input id="date" label="Date" type="date"
              value={date} onChange={(e) => setDate(e.target.value)} />

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter quote description" />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter any additional notes" />
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Quote"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/quotes")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddQuotePage;