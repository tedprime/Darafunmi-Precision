import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  AlertCircle, Loader2, Save, Send, Calendar,
  Bold, Italic, List, Link as LinkIcon, Unlink,
} from "lucide-react";
import { confirmDialog } from "../../components/common/confirmDialog";
import {
  getCampaign, createCampaign, updateCampaign, sendCampaign,
} from "../../../services/newsletter.jsx";
import { useToast } from "../../../services/useToast";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ToolbarBtn = ({
  active, onClick, title, children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded text-sm transition-colors ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const NewsletterComposePage: React.FC = () => {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();
  const isEdit      = Boolean(id);
  const { toast }   = useToast() as { toast: { success: (m: string) => void; error: (m: string) => void } };

  const [subject,   setSubject]   = useState("");
  const [preheader, setPreheader] = useState("");
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [sending,      setSending]      = useState(false);
  const [scheduling,   setScheduling]   = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [error,        setError]        = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-gray-800",
      },
    },
  });

  useEffect(() => {
    if (!id) return;
    getCampaign(id)
      .then((res: any) => {
        const c = res.data ?? res;
        setSubject(c.subject ?? "");
        setPreheader(c.preheader ?? "");
        setCampaignId(c.id);
        editor?.commands.setContent(c.content ?? "");
        if (c.scheduledFor) {
          // Format as datetime-local string (YYYY-MM-DDTHH:mm)
          const d = new Date(c.scheduledFor);
          setScheduledFor(d.toISOString().slice(0, 16));
          setShowSchedule(true);
        }
      })
      .catch((err: any) => setLoadError(err?.message || "Failed to load campaign."))
      .finally(() => setLoading(false));
  }, [id, editor]);

  const getContent = useCallback(() => editor?.getHTML() ?? "", [editor]);

  const validate = () => {
    if (!subject.trim()) { setError("Subject line is required."); return false; }
    const content = getContent();
    if (!content || content === "<p></p>") { setError("Email content cannot be empty."); return false; }
    return true;
  };

  const basePayload = () => ({
    subject:    subject.trim(),
    preheader:  preheader.trim(),
    content:    getContent(),
  });

  const saveOrCreate = async (extra: Record<string, any> = {}): Promise<number> => {
    const payload = { ...basePayload(), ...extra };
    if (campaignId) {
      await updateCampaign(campaignId, payload);
      return campaignId;
    }
    const res: any = await createCampaign(payload);
    const id = (res.data ?? res).id;
    setCampaignId(id);
    navigate(`/newsletter/edit/${id}`, { replace: true });
    return id;
  };

  const handleSaveDraft = async () => {
    setError(null);
    if (!subject.trim()) { setError("Subject line is required."); return; }
    setSaving(true);
    try {
      await saveOrCreate({ scheduledFor: null }); // clear any schedule when saving as draft
    } catch (err: any) {
      setError(err?.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    setError(null);
    if (!validate()) return;
    if (!scheduledFor) { setError("Please pick a date and time to schedule."); return; }
    const schedDate = new Date(scheduledFor);
    if (schedDate <= new Date()) { setError("Scheduled time must be in the future."); return; }

    if (!(await confirmDialog({
      title: "Schedule newsletter?",
      description: `This will send to all active subscribers on ${schedDate.toLocaleString()}.`,
      confirmLabel: "Schedule",
      variant: "danger",
    }))) return;

    setScheduling(true);
    try {
      await saveOrCreate({ scheduledFor });
      toast.success("Newsletter scheduled!");
      navigate("/newsletter");
    } catch (err: any) {
      setError(err?.message || "Failed to schedule campaign.");
    } finally {
      setScheduling(false);
    }
  };

  const handleSend = async () => {
    setError(null);
    if (!validate()) return;

    if (!(await confirmDialog({
      title: "Send newsletter?",
      description: "This will send the email to all active subscribers immediately. This cannot be undone.",
      confirmLabel: "Send Now",
      variant: "danger",
    }))) return;

    setSending(true);
    try {
      const idToSend = await saveOrCreate({ scheduledFor: null });
      const result: any = await sendCampaign(idToSend);
      toast.success(result?.message || "Newsletter sent successfully!");
      navigate("/newsletter");
    } catch (err: any) {
      setError(err?.message || "Failed to send campaign.");
    } finally {
      setSending(false);
    }
  };

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes("link").href || "";
    const url  = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (loading) {
    return (
      <Layout pageTitle="Compose Newsletter" pageSubtitle="Write and send a newsletter to all subscribers">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-32 mb-5" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-20 mb-5" />
              <Skeleton className="h-8 w-full mb-3" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout pageTitle="Compose Newsletter" pageSubtitle="">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load campaign</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={isEdit ? "Edit Newsletter" : "Compose Newsletter"}
      pageSubtitle="Write and send a newsletter to all active subscribers"
    >
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-5">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Subject + preheader */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Email Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Our Latest Calibration Insights — June 2026"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preview Text <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  maxLength={150}
                  placeholder="Short summary shown in email clients before opening…"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">{preheader.length}/150 · Appears as inbox preview text</p>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1 flex-wrap">
              <ToolbarBtn
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                title="Bold"
              >
                <Bold size={15} />
              </ToolbarBtn>
              <ToolbarBtn
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                title="Italic"
              >
                <Italic size={15} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <ToolbarBtn
                active={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                title="Bullet list"
              >
                <List size={15} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <ToolbarBtn
                active={editor?.isActive("link")}
                onClick={setLink}
                title="Insert link"
              >
                <LinkIcon size={15} />
              </ToolbarBtn>
              {editor?.isActive("link") && (
                <ToolbarBtn
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  title="Remove link"
                >
                  <Unlink size={15} />
                </ToolbarBtn>
              )}
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Publish</h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || saving || scheduling}
                className="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sending
                  ? <><Loader2 size={15} className="animate-spin" />Sending…</>
                  : <><Send size={15} />Send Now</>
                }
              </button>

              {/* Schedule toggle */}
              <button
                type="button"
                onClick={() => setShowSchedule((v) => !v)}
                disabled={sending || saving || scheduling}
                className="w-full px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calendar size={15} />
                {showSchedule ? "Cancel schedule" : "Schedule for later"}
              </button>

              {showSchedule && (
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSchedule}
                    disabled={!scheduledFor || scheduling || sending || saving}
                    className="w-full px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {scheduling
                      ? <><Loader2 size={15} className="animate-spin" />Scheduling…</>
                      : <><Calendar size={15} />Confirm Schedule</>
                    }
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || sending || scheduling}
                className="w-full px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving
                  ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                  : <><Save size={15} />Save Draft</>
                }
              </button>
              <button
                type="button"
                onClick={() => navigate("/newsletter")}
                disabled={saving || sending || scheduling}
                className="w-full px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-800 mb-1">Before you send</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Double-check the subject line</li>
              <li>Each email includes an unsubscribe link</li>
              <li>Sending cannot be undone</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsletterComposePage;
