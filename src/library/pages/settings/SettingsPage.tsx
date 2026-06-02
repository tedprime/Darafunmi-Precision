import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Save } from "lucide-react";
import { apiFetch } from "../../../services/api.jsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Settings {
  appName: string;
  timezone: string;
  language: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  emailNotifications: boolean;
  certExpiryAlerts: boolean;
  newOrderNotifications: boolean;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

// ─── Skeleton Components ──────────────────────────────────────────────────────

const SkeletonPulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SettingsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left column - 2/3 width */}
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <SkeletonPulse className="h-4 w-24 mb-4" />
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-3 w-48 mt-2" />
      </Card>

      <Card>
        <SkeletonPulse className="h-4 w-20 mb-4" />
        <SkeletonPulse className="h-24 w-full" />
        <SkeletonPulse className="h-3 w-32 mt-2" />
      </Card>

      <Card>
        <SkeletonPulse className="h-4 w-16 mb-4" />
        <SkeletonPulse className="h-48 w-full" />
        <SkeletonPulse className="h-3 w-40 mt-2" />
      </Card>
    </div>

    {/* Right column - 1/3 width */}
    <div className="space-y-6">
      <Card>
        <SkeletonPulse className="h-4 w-32 mb-4" />
        <SkeletonPulse className="h-40 w-full rounded-lg" />
      </Card>

      <Card>
        <SkeletonPulse className="h-4 w-24 mb-4" />
        <SkeletonPulse className="h-10 w-full" />
      </Card>

      <Card>
        <SkeletonPulse className="h-4 w-20 mb-4" />
        <SkeletonPulse className="h-10 w-full" />
      </Card>

      <Card>
        <SkeletonPulse className="h-4 w-28 mb-3" />
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-5 w-5 rounded" />
          <SkeletonPulse className="h-4 w-32" />
        </div>
        <SkeletonPulse className="h-3 w-56 mt-2" />
      </Card>

      <SkeletonPulse className="h-10 w-full" />
      <SkeletonPulse className="h-10 w-full" />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings>({
    appName: "",
    timezone: "",
    language: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    emailNotifications: true,
    certExpiryAlerts: true,
    newOrderNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Fetch settings on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/settings");
        if (res.success) setSettings(res.data);
      } catch {
        setErrorMsg("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async (patch: Partial<Settings>) => {
    setSaveStatus("saving");
    setErrorMsg(null);
    try {
      const res = await apiFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (res.success) {
        setSettings((prev) => ({ ...prev, ...patch }));
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (err) {
      const error = err as { message?: string };
      if (error.message?.includes("403")) {
        setErrorMsg("Permission denied — superadmin role required.");
      } else {
        setErrorMsg("Failed to save settings. Please try again.");
      }
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // ── Save button label ────────────────────────────────────────────────────
  const saveLabel = () => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "success") return "Saved!";
    if (saveStatus === "error") return "Failed";
    return "Save Changes";
  };

  const saveButtonClass = () => {
    if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (saveStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "";
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Layout
      pageTitle="Settings"
      pageSubtitle="Manage your application settings and preferences"
    >
      {/* Global error banner */}
      {errorMsg && !loading && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 max-w-3xl">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <>
          {/* Tab bar */}
          <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
            {["general", "company", "notifications"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md capitalize ${
                  activeTab === tab
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setErrorMsg(null);
                  setSaveStatus("idle");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <Card className="w-full">
            {/* ── General ──────────────────────────────────────────────────────── */}
            {activeTab === "general" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  General Settings
                </h3>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave({
                      appName: settings.appName,
                      timezone: settings.timezone,
                      language: settings.language,
                    });
                  }}
                >
                  <Input
                    id="appName"
                    label="Application Name"
                    value={settings.appName}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, appName: e.target.value }))
                    }
                  />
                  <Input
                    id="timezone"
                    label="Timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, timezone: e.target.value }))
                    }
                  />
                  <Input
                    id="language"
                    label="Language"
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, language: e.target.value }))
                    }
                  />
                  <Button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className={`flex items-center mt-4 ${saveButtonClass()}`}
                  >
                    <Save size={16} className="mr-2" /> {saveLabel()}
                  </Button>
                </form>
              </div>
            )}

            {/* ── Company ──────────────────────────────────────────────────────── */}
            {activeTab === "company" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Company Information
                </h3>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave({
                      companyName: settings.companyName,
                      companyEmail: settings.companyEmail,
                      companyPhone: settings.companyPhone,
                      companyAddress: settings.companyAddress,
                    });
                  }}
                >
                  <Input
                    id="compName"
                    label="Company Name"
                    placeholder="Your Company Name"
                    value={settings.companyName}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        companyName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    id="compEmail"
                    label="Company Email"
                    placeholder="info@company.com"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        companyEmail: e.target.value,
                      }))
                    }
                  />
                  <Input
                    id="compPhone"
                    label="Company Phone"
                    placeholder="+1 (555) 000-0000"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        companyPhone: e.target.value,
                      }))
                    }
                  />
                  <Input
                    id="compAddress"
                    label="Address"
                    placeholder="123 Main Street, City, State"
                    value={settings.companyAddress}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        companyAddress: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className={`flex items-center mt-4 ${saveButtonClass()}`}
                  >
                    <Save size={16} className="mr-2" /> {saveLabel()}
                  </Button>
                </form>
              </div>
            )}

            {/* ── Notifications ────────────────────────────────────────────────── */}
            {activeTab === "notifications" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Notification Preferences
                </h3>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave({
                      emailNotifications: settings.emailNotifications,
                      certExpiryAlerts: settings.certExpiryAlerts,
                      newOrderNotifications: settings.newOrderNotifications,
                    });
                  }}
                >
                  {[
                    {
                      key: "emailNotifications" as const,
                      label: "Email Notifications",
                      description: "Receive email for important updates",
                    },
                    {
                      key: "certExpiryAlerts" as const,
                      label: "Certificate Expiry Alerts",
                      description:
                        "Get notified when certificates are about to expire",
                    },
                    {
                      key: "newOrderNotifications" as const,
                      label: "New Order Notifications",
                      description: "Get notified when new orders are received",
                    },
                  ].map(({ key, label, description }) => (
                    <div
                      key={key}
                      className="flex items-start justify-between border-b border-gray-200 pb-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) =>
                          setSettings((p) => ({
                            ...p,
                            [key]: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <Button
                    type="submit"
                    disabled={saveStatus === "saving"}
                    className={`flex items-center mt-4 ${saveButtonClass()}`}
                  >
                    <Save size={16} className="mr-2" /> {saveLabel()}
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </>
      )}
    </Layout>
  );
};

export default SettingsPage;
