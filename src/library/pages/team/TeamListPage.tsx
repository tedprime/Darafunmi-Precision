import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import { TriangleAlert, Plus, Pencil, Trash2 } from "lucide-react";
import { getTeamMembers, deleteTeamMember } from "../../../services/team.jsx";
import { useToast } from "../../../services/useToast";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  order?: number;
  isVisible: boolean;
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
    if (!confirm(`Delete "${member.name}" from the team?`)) return;
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

  const headers = ["", "Name", "Role", "Visibility", "Order", "Actions"];

  const data = members.map((member) => [
    <div key={`img-${member.id}`} className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
      {member.imageUrl ? (
        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-gray-500">
          {member.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>,
    member.name,
    member.role,
    <Badge key={`vis-${member.id}`} color={member.isVisible ? "green" : "gray"}>
      {member.isVisible ? "Visible" : "Hidden"}
    </Badge>,
    member.order ?? "—",
    <div key={`actions-${member.id}`} className="flex gap-2">
      <button
        onClick={() => navigate(`/team/edit/${member.id}`)}
        title="Edit"
        className="p-1 border border-blue-100 text-blue-500 hover:bg-blue-50 rounded transition-colors"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => handleDelete(member)}
        disabled={deletingId === member.id}
        title="Delete"
        className="p-1 border border-red-100 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout pageTitle="Team" pageSubtitle="Manage team members.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate("/team/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load team members</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            All Members{" "}
            <span className="text-sm font-normal text-gray-400">
              ({members.length})
            </span>
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No team members yet.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default TeamListPage;