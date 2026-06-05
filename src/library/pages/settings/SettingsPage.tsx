import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Save } from "lucide-react";
import { apiFetch } from "../../../services/api.jsx";
import { updateProfile, changePassword, getStoredUser } from "../../../services/auth.jsx";

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

const SkeletonPulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SettingsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
    <div className="space-y-6">
      <Card>
        <SkeletonPulse className="h-4 w-32 mb-4" />
        <SkeletonPulse className="h-40 w-full rounded-lg" />
      </Card>
      <SkeletonPulse className="h-10 w-full" />
    </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings>({
    appName: "", timezone: "", language: "",
    companyName: "", companyEmail: "", companyPhone: "", companyAddress: "",
    emailNotifications: true, certExpiryAlerts: true, newOrderNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile state
  const storedUser = getStoredUser();
  const [profileName, setProfileName] = useState(storedUser?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(storedUser?.email ?? "");
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/settings")
      .then((res) => { if (res.success) setSettings(res.data); })
      .catch(() => setErrorMsg("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

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
      setErrorMsg(
        error.message?.includes("403")
          ? "Permission denied — superadmin role required."
          : "Failed to save settings. Please try again."
      );
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!profileName.trim()) { setProfileError("Name is required."); return; }
    if (!profileEmail.trim()) { setProfileError("Email is required."); return; }
    setProfileStatus("saving");
    try {
      await updateProfile({ name: profileName.trim(), email: profileEmail.trim() });
      // Update stored user so header reflects new name/email immediately
      const updated = { ...(getStoredUser() ?? {}), name: profileName.trim(), email: profileEmail.trim() };
      localStorage.setItem("user", JSON.stringify(updated));
      setProfileStatus("success");
      setTimeout(() => setProfileStatus("idle"), 2500);
    } catch (err) {
      const error = err as { message?: string };
      setProfileError(error.message ?? "Failed to update profile.");
      setProfileStatus("error");
      setTimeout(() => setProfileStatus("idle"), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword) { setPasswordError("Current password is required."); return; }
    if (!newPassword) { setPasswordError("New password is required."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match."); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    setPasswordStatus("saving");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("success");
      setTimeout(() => setPasswordStatus("idle"), 2500);
    } catch (err) {
      const error = err as { message?: string };
      setPasswordError(error.message ?? "Failed to change password.");
      setPasswordStatus("error");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    }
  };

  const saveLabel = (status: SaveStatus) => {
    if (status === "saving") return "Saving...";
    if (status === "success") return "Saved!";
    if (status === "error") return "Failed";
    return "Save Changes";
  };

  const saveButtonClass = (status: SaveStatus) => {
    if (status === "success") return "bg-green-600 hover:bg-green-700";
    if (status === "error") return "bg-red-600 hover:bg-red-700";
    return "";
  };

  return (
    <Layout pageTitle="Settings" pageSubtitle="Manage your application settings and preferences">
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
            {["general", "company", "notifications", "profile"].map((tab) => (
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
            {/* General */}
            {activeTab === "general" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave({ appName: settings.appName, timezone: settings.timezone, language: settings.language }); }}>
                  <Input id="appName" label="Application Name" value={settings.appName} onChange={(e) => setSettings((p) => ({ ...p, appName: e.target.value }))} />
                  <Input id="timezone" label="Timezone" value={settings.timezone} onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))} />
                  <Input id="language" label="Language" value={settings.language} onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))} />
                  <Button type="submit" disabled={saveStatus === "saving"} className={`flex items-center mt-4 ${saveButtonClass(saveStatus)}`}>
                    <Save size={16} className="mr-2" /> {saveLabel(saveStatus)}
                  </Button>
                </form>
              </div>
            )}

            {/* Company */}
            {activeTab === "company" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave({ companyName: settings.companyName, companyEmail: settings.companyEmail, companyPhone: settings.companyPhone, companyAddress: settings.companyAddress }); }}>
                  <Input id="compName" label="Company Name" placeholder="Your Company Name" value={settings.companyName} onChange={(e) => setSettings((p) => ({ ...p, companyName: e.target.value }))} />
                  <Input id="compEmail" label="Company Email" placeholder="info@company.com" type="email" value={settings.companyEmail} onChange={(e) => setSettings((p) => ({ ...p, companyEmail: e.target.value }))} />
                  <Input id="compPhone" label="Company Phone" placeholder="+1 (555) 000-0000" value={settings.companyPhone} onChange={(e) => setSettings((p) => ({ ...p, companyPhone: e.target.value }))} />
                  <Input id="compAddress" label="Address" placeholder="123 Main Street, City, State" value={settings.companyAddress} onChange={(e) => setSettings((p) => ({ ...p, companyAddress: e.target.value }))} />
                  <Button type="submit" disabled={saveStatus === "saving"} className={`flex items-center mt-4 ${saveButtonClass(saveStatus)}`}>
                    <Save size={16} className="mr-2" /> {saveLabel(saveStatus)}
                  </Button>
                </form>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave({ emailNotifications: settings.emailNotifications, certExpiryAlerts: settings.certExpiryAlerts, newOrderNotifications: settings.newOrderNotifications }); }}>
                  {[
                    { key: "emailNotifications" as const, label: "Email Notifications", description: "Receive email for important updates" },
                    { key: "certExpiryAlerts" as const, label: "Certificate Expiry Alerts", description: "Get notified when certificates are about to expire" },
                    { key: "newOrderNotifications" as const, label: "New Order Notifications", description: "Get notified when new orders are received" },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-start justify-between border-b border-gray-200 pb-4">
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.checked }))} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </div>
                  ))}
                  <Button type="submit" disabled={saveStatus === "saving"} className={`flex items-center mt-4 ${saveButtonClass(saveStatus)}`}>
                    <Save size={16} className="mr-2" /> {saveLabel(saveStatus)}
                  </Button>
                </form>
              </div>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Update name / email */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Profile</h3>
                  <p className="text-sm text-gray-500 mb-4">Update the name and email address used to log in.</p>
                  {profileError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                      {profileError}
                    </div>
                  )}
                  <form className="space-y-4 max-w-md" onSubmit={handleProfileSave}>
                    <Input id="profileName" label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    <Input id="profileEmail" label="Email Address" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                    <Button type="submit" disabled={profileStatus === "saving"} className={`flex items-center ${saveButtonClass(profileStatus)}`}>
                      <Save size={16} className="mr-2" /> {saveLabel(profileStatus)}
                    </Button>
                  </form>
                </div>

                <hr className="border-gray-200" />

                {/* Change password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">Enter your current password then choose a new one.</p>
                  {passwordError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                      {passwordError}
                    </div>
                  )}
                  {passwordStatus === "success" && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                      Password updated successfully.
                    </div>
                  )}
                  <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
                    <Input id="currentPassword" label="Current Password" type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <Input id="newPassword" label="New Password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <Input id="confirmPassword" label="Confirm New Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button type="submit" disabled={passwordStatus === "saving"} className={`flex items-center ${saveButtonClass(passwordStatus)}`}>
                      <Save size={16} className="mr-2" />
                      {passwordStatus === "saving" ? "Updating..." : passwordStatus === "success" ? "Updated!" : "Update Password"}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </Layout>
  );
};

export default SettingsPage;