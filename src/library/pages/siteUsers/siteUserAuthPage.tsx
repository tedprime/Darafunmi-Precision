import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { UserPlus, Info } from "lucide-react";
import { registerSiteUser } from "../../../services/siteUsers.jsx";

const SiteUserAuthPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }

    setSubmitting(true);
    try {
      await registerSiteUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        company: company.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to register user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setCompany("");
    setError(null);
    setSuccess(false);
  };

  return (
    <Layout
      pageTitle="Auth Management"
      pageSubtitle="Manually register a site user account on behalf of a customer."
    >
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Use this form to create a customer account manually. The customer will
          be able to log in with the email and password you set. To manage
          existing accounts (activate / deactivate), visit{" "}
          <button
            onClick={() => navigate("/site-users")}
            className="underline font-medium hover:text-blue-900"
          >
            Site Users
          </button>
          .
        </p>
      </div>

      {/* Success state */}
      {success ? (
        <Card className="text-center py-12">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
            <UserPlus size={22} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Account created
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            The site user has been registered successfully.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleReset}>Register another</Button>
            <Button variant="secondary" onClick={() => navigate("/site-users")}>
              View site users
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              New Site User
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <Input
                id="name"
                label="Full Name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                id="phone"
                label="Phone (optional)"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                id="company"
                label="Company (optional)"
                placeholder="Enter company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </Card>

          <div className="flex space-x-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/site-users")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default SiteUserAuthPage;