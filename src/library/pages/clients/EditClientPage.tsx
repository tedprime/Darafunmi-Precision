import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { updateClient } from "../../../services/client.jsx";
import { apiFetch } from "../../../services/api";

const EditClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/clients/${id}`)
      .then((res: { data: { name: string; email: string; phone: string; location: string; address: string; status: string } }) => {
        const c = res.data;
        setName(c.name ?? "");
        setEmail(c.email ?? "");
        setPhone(c.phone ?? "");
        setLocation(c.location ?? "");
        setAddress(c.address ?? "");
        setStatus(c.status ?? "active");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await updateClient(id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        address: address.trim(),
        status,
      });
      navigate("/clients");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update client.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Client" pageSubtitle="Update client information">
      {loading && <p className="text-sm text-gray-500">Loading client...</p>}

      {!loading && (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <Card className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Client Information
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Input
                  id="clientName"
                  label="Client Name"
                  placeholder="Enter client name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="phone"
                  label="Phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  id="location"
                  label="Location"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter full address"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/clients")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </Layout>
  );
};

export default EditClientPage;