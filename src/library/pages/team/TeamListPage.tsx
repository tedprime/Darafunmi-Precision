import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Edit2, Trash2, TriangleAlert, Eye, EyeOff } from "lucide-react";
import { getTeamMembers, deleteTeamMember, toggleTeamMemberVisibility } from "../../../services/team.jsx";
import { useToast } from "../../../services/useToast";

interface TeamMember {
  id: number;
  name: string;
  title?: string | null;      // DB column name
  bio?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;         // DB column name
  isActive: boolean;          // DB column name
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const TeamListPage: React.FC = () => {
  const { toast } = useToast() as {
    toast: {
      success: (msg: string) => void;
      error: (msg: string) => void;
      info: (msg: string) => void;
    };
  };
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    getTeamMembers()
      .then((res) => {
        setMembers(res.data ?? res);
        setError(null);
      })
      .catch((err) => setError(err.message ?? "Failed to load team members"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (member: TeamMember) => {
    if (!(await confirmDialog({
      title: "Delete team member?",
      description: `Delete "${member.name}" from the team?`,
      confirmLabel: "Delete",
    }))) return;
    setDeletingId(member.id);
    try {
      await deleteTeamMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.name} has been deleted.`);
    } catch {
      toast.error("Failed to delete team member.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (member: TeamMember) => {
    setTogglingId(member.id);
    try {
      await toggleTeamMemberVisibility(member.id, !member.isActive);
      setMembers((prev) =>
        prev.map((m) => m.id === member.id ? { ...m, isActive: !m.isActive } : m)
      );
      toast.success(
        `${member.name} is now ${!member.isActive ? "visible" : "hidden"} on the website.`
      );
    } catch {
      toast.error("Failed to update visibility.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Layout
      pageTitle="Team"
      pageSubtitle="Manage team members."
      action={
        <Button onClick={() => navigate("/team/add")}>
          <Plus size={16} /> Add Member
        </Button>
      }
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load team members</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No team members yet.</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 break-words">{member.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{member.title}</p>
                  </div>
                </div>

                {/* Badge + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Badge color={member.isActive ? "green" : "gray"}>
                    {member.isActive ? "Visible" : "Hidden"}
                  </Badge>
                  <div className="flex gap-1.5">
                    {/* Visibility toggle */}
                    <button
                      title={member.isActive ? "Hide from website" : "Show on website"}
                      className={`p-1.5 rounded-md border transition-colors disabled:opacity-40 ${
                        member.isActive
                          ? "border-gray-200 text-gray-400 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50"
                          : "border-green-200 text-green-500 hover:bg-green-50"
                      }`}
                      onClick={() => handleToggleVisibility(member)}
                      disabled={togglingId === member.id || deletingId === member.id}
                    >
                      {member.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    <button
                      className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => navigate(`/team/edit/${member.id}`)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                      onClick={() => handleDelete(member)}
                      disabled={deletingId === member.id || togglingId === member.id}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
};

export default TeamListPage;
