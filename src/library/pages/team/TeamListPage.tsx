import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, TriangleAlert } from "lucide-react";
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

  return (
    <Layout
      pageTitle="Team"
      pageSubtitle="Manage team members."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/team/add")}
        >
          <Plus size={16} className="mr-2" /> Add Member
        </Button>
      }
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex justify-between items-center py-8 px-6">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              </div>
            </Card>
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
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No team members yet.
            </p>
          ) : (
            members.map((member) => (
              <Card
                key={member.id}
                className="flex justify-between items-center py-6 px-6"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
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
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">{member.role}</p>
                  </div>
                </div>

                {/* Badge + Actions */}
                <div className="flex items-center space-x-4">
                  <Badge color={member.isVisible ? "green" : "gray"}>
                    {member.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <div className="flex space-x-4 text-gray-400">
                    <button
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => navigate(`/team/edit/${member.id}`)}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600 disabled:opacity-40"
                      onClick={() => handleDelete(member)}
                      disabled={deletingId === member.id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </Layout>
  );
};

export default TeamListPage;