import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { Save, UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../../../services/api.jsx";
import { updateProfile, changePassword, register } from "../../../services/auth.jsx";
import { useAuth } from "../../../contexts/AuthContext";

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
type Tab = "general" | "company" | "notifications" | "profile" | "users";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

/* ── Reusable field components ─────────────────────────────────── */
const Field = ({
  label, id, children,
}: { label: string; id?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const TextInput = ({
  id, type = "text", value, onChange, placeholder,
}: {
  id?: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
  />
);

const Toggle = ({
  checked, onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const StatusBanner = ({ status, error }: { status: SaveStatus; error?: string | null }) => {
  if (status === "error" && error) return (
    <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 mb-5">
      <AlertCircle size={15} className="shrink-0" />{error}
    </div>
  );
  if (status === "success") return (
    <div className="flex items-center gap-2 p-3.5 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 mb-5">
      <CheckCircle2 size={15} className="shrink-0" />Saved successfully.
    </div>
  );
  return null;
};

const SaveBtn = ({
  status, label = "Save Changes", savingLabel = "Saving…", successLabel = "Saved!",
}: { status: SaveStatus; label?: string; savingLabel?: string; successLabel?: string }) => (
  <button
    type="submit"
    disabled={status === "saving"}
    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      status === "success" ? "bg-green-600 hover:bg-green-700 text-white"
      : status === "error"   ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
  >
    {status === "saving"
      ? <><Loader2 size={15} className="animate-spin" />{savingLabel}</>
      : status === "success"
      ? <><CheckCircle2 size={15} />{successLabel}</>
      : <><Save size={15} />{label}</>
    }
  </button>
);

/* ── Main page ─────────────────────────────────────────────────── */
const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const isAdminRole = user?.role === "admin" || user?.role === "superadmin";
  const [activeTab, setActiveTab] = useState<Tab>(isAdminRole ? "general" : "profile");
  const [settings, setSettings] = useState<Settings>({
    appName: "", timezone: "", language: "",
    companyName: "", companyEmail: "", companyPhone: "", companyAddress: "",
    emailNotifications: true, certExpiryAlerts: true, newOrderNotifications: true,
  });
  const [loading,    setLoading]    = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  const [profileName,   setProfileName]   = useState(user?.name ?? "");
  const [profileEmail,  setProfileEmail]  = useState(user?.email ?? "");
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");
  const [profileError,  setProfileError]  = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus,  setPasswordStatus]  = useState<SaveStatus>("idle");
  const [passwordError,   setPasswordError]   = useState<string | null>(null);

  const [inviteName,    setInviteName]    = useState("");
  const [inviteEmail,   setInviteEmail]   = useState("");
  const [inviteRole,    setInviteRole]    = useState<"staff" | "admin" | "superadmin">("staff");
  const [inviteStatus,  setInviteStatus]  = useState<SaveStatus>("idle");
  const [inviteError,   setInviteError]   = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/settings")
      .then((res: any) => { if (res.success) setSettings(res.data); })
      .catch(() => setErrorMsg("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const after = (set: (s: SaveStatus) => void, ms = 2500) =>
    setTimeout(() => set("idle"), ms);

  const handleSave = async (patch: Partial<Settings>) => {
    setSaveStatus("saving"); setErrorMsg(null);
    try {
      await apiFetch("/settings", { method: "PATCH", body: JSON.stringify(patch) });
      setSettings((p) => ({ ...p, ...patch }));
      setSaveStatus("success"); after(setSaveStatus);
    } catch (err: any) {
      setErrorMsg(err?.message?.includes("403")
        ? "Permission denied — superadmin role required."
        : "Failed to save settings.");
      setSaveStatus("error"); after(setSaveStatus, 3000);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileError(null);
    if (!profileName.trim()) { setProfileError("Name is required."); return; }
    if (!profileEmail.trim()) { setProfileError("Email is required."); return; }
    setProfileStatus("saving");
    try {
      await updateProfile({ name: profileName.trim(), email: profileEmail.trim() });
      setUser({ ...(user ?? {}), name: profileName.trim(), email: profileEmail.trim() } as typeof user);
      setProfileStatus("success"); after(setProfileStatus);
    } catch (err: any) {
      setProfileError(err?.message ?? "Failed to update profile.");
      setProfileStatus("error"); after(setProfileStatus, 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError(null);
    if (!currentPassword) { setPasswordError("Current password is required."); return; }
    if (!newPassword)     { setPasswordError("New password is required."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    setPasswordStatus("saving");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPasswordStatus("success"); after(setPasswordStatus);
    } catch (err: any) {
      setPasswordError(err?.message ?? "Failed to change password.");
      setPasswordStatus("error"); after(setPasswordStatus, 3000);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setInviteError(null); setInviteSuccess(null);
    if (!inviteName.trim())  { setInviteError("Name is required."); return; }
    if (!inviteEmail.trim()) { setInviteError("Email is required."); return; }
    setInviteStatus("saving");
    try {
      await register({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole });
      setInviteSuccess(`Account created — a temporary password has been sent to ${inviteEmail.trim()}.`);
      setInviteName(""); setInviteEmail(""); setInviteRole("staff");
      setInviteStatus("success");
      setTimeout(() => { setInviteStatus("idle"); setInviteSuccess(null); }, 5000);
    } catch (err: any) {
      setInviteError(err?.message ?? "Failed to create user.");
      setInviteStatus("error"); after(setInviteStatus, 3000);
    }
  };

  const role = user?.role ?? "staff";
  const isAdmin = role === "admin" || role === "superadmin";

  const ALL_TABS: { key: Tab; label: string; adminOnly: boolean }[] = [
    { key: "general",       label: "General",       adminOnly: true  },
    { key: "company",       label: "Company",       adminOnly: true  },
    { key: "notifications", label: "Notifications", adminOnly: true  },
    { key: "profile",       label: "Profile",       adminOnly: false },
    { key: "users",         label: "Users",         adminOnly: true  },
  ];
  const TABS = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <Layout pageTitle="Settings" pageSubtitle="Manage your application settings and preferences">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setErrorMsg(null); setSaveStatus("idle"); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : (
        <div className="max-w-2xl">

          {/* ── General ── */}
          {activeTab === "general" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">General Settings</h3>
              <StatusBanner status={saveStatus} error={errorMsg} />
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleSave({ appName: settings.appName, timezone: settings.timezone, language: settings.language }); }}
              >
                <Field label="Application Name" id="appName">
                  <TextInput id="appName" value={settings.appName} onChange={(e) => setSettings((p) => ({ ...p, appName: e.target.value }))} placeholder="Darafunmi Admin" />
                </Field>
                <Field label="Timezone" id="timezone">
                  <TextInput id="timezone" value={settings.timezone} onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))} placeholder="Africa/Lagos" />
                </Field>
                <Field label="Language" id="language">
                  <TextInput id="language" value={settings.language} onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))} placeholder="en" />
                </Field>
                <div className="pt-2">
                  <SaveBtn status={saveStatus} />
                </div>
              </form>
            </div>
          )}

          {/* ── Company ── */}
          {activeTab === "company" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Company Information</h3>
              <StatusBanner status={saveStatus} error={errorMsg} />
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleSave({ companyName: settings.companyName, companyEmail: settings.companyEmail, companyPhone: settings.companyPhone, companyAddress: settings.companyAddress }); }}
              >
                <Field label="Company Name" id="compName">
                  <TextInput id="compName" value={settings.companyName} onChange={(e) => setSettings((p) => ({ ...p, companyName: e.target.value }))} placeholder="Darafunmi Precision Technologies" />
                </Field>
                <Field label="Email" id="compEmail">
                  <TextInput id="compEmail" type="email" value={settings.companyEmail} onChange={(e) => setSettings((p) => ({ ...p, companyEmail: e.target.value }))} placeholder="info@darafunmi.com" />
                </Field>
                <Field label="Phone" id="compPhone">
                  <TextInput id="compPhone" value={settings.companyPhone} onChange={(e) => setSettings((p) => ({ ...p, companyPhone: e.target.value }))} placeholder="+234 803 468 0544" />
                </Field>
                <Field label="Address" id="compAddress">
                  <TextInput id="compAddress" value={settings.companyAddress} onChange={(e) => setSettings((p) => ({ ...p, companyAddress: e.target.value }))} placeholder="123 Main Street, Lagos" />
                </Field>
                <div className="pt-2">
                  <SaveBtn status={saveStatus} />
                </div>
              </form>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Notification Preferences</h3>
              <StatusBanner status={saveStatus} error={errorMsg} />
              <form
                onSubmit={(e) => { e.preventDefault(); handleSave({ emailNotifications: settings.emailNotifications, certExpiryAlerts: settings.certExpiryAlerts, newOrderNotifications: settings.newOrderNotifications }); }}
              >
                <div className="space-y-0 divide-y divide-gray-100">
                  {([
                    { key: "emailNotifications" as const,    label: "Email Notifications",        desc: "Receive emails for important updates" },
                    { key: "certExpiryAlerts" as const,      label: "Certificate Expiry Alerts",   desc: "Get notified when certificates are about to expire" },
                    { key: "newOrderNotifications" as const, label: "New Order Notifications",     desc: "Get notified when new orders are received" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={settings[key]} onChange={(v) => setSettings((p) => ({ ...p, [key]: v }))} />
                    </div>
                  ))}
                </div>
                <div className="pt-5">
                  <SaveBtn status={saveStatus} />
                </div>
              </form>
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Name + email */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Profile</h3>
                <p className="text-xs text-gray-400 mb-5">Update the name and email used to log in.</p>
                <StatusBanner status={profileStatus} error={profileError} />
                <form className="space-y-4" onSubmit={handleProfileSave}>
                  <Field label="Full Name" id="profileName">
                    <TextInput id="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
                  </Field>
                  <Field label="Email Address" id="profileEmail">
                    <TextInput id="profileEmail" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="you@darafunmi.com" />
                  </Field>
                  <div className="pt-2">
                    <SaveBtn status={profileStatus} />
                  </div>
                </form>
              </div>

              {/* Password */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Change Password</h3>
                <p className="text-xs text-gray-400 mb-5">Enter your current password then choose a new one.</p>
                <StatusBanner status={passwordStatus} error={passwordError} />
                <form className="space-y-4" onSubmit={handlePasswordChange}>
                  <Field label="Current Password" id="currentPw">
                    <TextInput id="currentPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                  </Field>
                  <Field label="New Password" id="newPw">
                    <TextInput id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                  </Field>
                  <Field label="Confirm New Password" id="confirmPw">
                    <TextInput id="confirmPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  </Field>
                  <div className="pt-2">
                    <SaveBtn status={passwordStatus} label="Update Password" savingLabel="Updating…" successLabel="Updated!" />
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Invite Admin User</h3>
              <p className="text-xs text-gray-400 mb-5">Create a new admin account. A temporary password will be emailed to the new user.</p>

              {inviteError && (
                <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 mb-5">
                  <AlertCircle size={15} className="shrink-0" />{inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="flex items-center gap-2 p-3.5 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 mb-5">
                  <CheckCircle2 size={15} className="shrink-0" />{inviteSuccess}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleInvite}>
                <Field label="Full Name" id="inviteName">
                  <TextInput id="inviteName" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" />
                </Field>
                <Field label="Email Address" id="inviteEmail">
                  <TextInput id="inviteEmail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="john@darafunmi.com" />
                </Field>
                <Field label="Role" id="inviteRole">
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "staff" | "admin" | "superadmin")}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  >
                    <option value="staff">Staff — can manage content</option>
                    <option value="admin">Admin — full access</option>
                    <option value="superadmin">Superadmin — can manage settings</option>
                  </select>
                </Field>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={inviteStatus === "saving"}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                      inviteStatus === "success" ? "bg-green-600 hover:bg-green-700 text-white"
                      : inviteStatus === "error"  ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {inviteStatus === "saving"
                      ? <><Loader2 size={15} className="animate-spin" />Sending invite…</>
                      : inviteStatus === "success"
                      ? <><CheckCircle2 size={15} />Invited!</>
                      : <><UserPlus size={15} />Send Invite</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;
