import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Edit2, Trash2, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCaseStudies, deleteCaseStudy } from "../../../services/caseStudy";

export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  clientName?: string;
  industry?: string;
  featuredImage?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CaseStudyListPage = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getCaseStudies({ limit: 50, adminView: true })
      .then(({ data }) => setStudies(data))
      .catch((err: { message?: string }) =>
        setError(err.message ?? "Failed to load case studies.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog({
      title: "Delete case study?",
      description: "This case study will be permanently removed. This cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    }))) return;
    try {
      await deleteCaseStudy(id);
      setStudies((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // toastError already fired inside deleteCaseStudy
    }
  };

  return (
    <Layout
      pageTitle="Case Studies"
      pageSubtitle="Manage all case study content here."
      action={
        <Button onClick={() => navigate("/case-studies/add")}>
          <Plus size={16} /> Add Case Study
        </Button>
      }
    >
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-14 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-64 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-500" />
          <p className="text-gray-700 font-medium">Failed to load case studies</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {studies.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No case studies found.</p>
          ) : (
            studies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {study.featuredImage ? (
                    <img
                      src={study.featuredImage}
                      alt={study.title}
                      className="w-14 h-10 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 break-words">
                      {study.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {study.clientName && (
                        <span className="mr-2">{study.clientName}</span>
                      )}
                      {study.industry && (
                        <span className="mr-2 text-gray-400">{study.industry}</span>
                      )}
                      {study.createdAt && (
                        <span className="text-gray-400">
                          {new Date(study.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {study.isFeatured && (
                    <Badge color="yellow">Featured</Badge>
                  )}
                  <Badge color={study.isPublished ? "blue" : "gray"}>
                    {study.isPublished ? "published" : "draft"}
                  </Badge>
                  <div className="flex gap-1.5">
                    <button
                      className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => navigate(`/case-studies/edit/${study.slug ?? study.id}`)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(study.id)}
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

export default CaseStudyListPage;
