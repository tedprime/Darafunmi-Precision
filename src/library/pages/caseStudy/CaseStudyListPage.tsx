import { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
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
    getCaseStudies({ limit: 50 })
      .then(({ data }) => setStudies(data))
      .catch((err: { message?: string }) =>
        setError(err.message ?? "Failed to load case studies.")
      )
      .finally(() => setLoading(false));
  };

  // useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this case study?")) return;
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
        <Button
          className="flex items-center"
          onClick={() => navigate("/case-studies/add")}
        >
          <Plus size={16} className="mr-2" /> Add Case Study
        </Button>
      }
    >
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="flex justify-between items-center py-8 px-6">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-14 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-64 mb-3" />
                  <Skeleton className="h-4 w-40" />
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

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-500" />
          <p className="text-gray-700 font-medium">Failed to load case studies</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {studies.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No case studies found.
            </p>
          ) : (
            studies.map((study) => (
              <Card
                key={study.id}
                className="flex justify-between items-center py-8 px-6"
              >
                <div className="flex items-center gap-4">
                  {study.featuredImage ? (
                    <img
                      src={study.featuredImage}
                      alt={study.title}
                      className="w-14 h-10 object-cover rounded-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-10 rounded-md bg-gray-100 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      {study.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {study.clientName && (
                        <span className="mr-3">{study.clientName}</span>
                      )}
                      {study.industry && (
                        <span className="mr-3 text-gray-400">{study.industry}</span>
                      )}
                      {study.createdAt && (
                        <span className="text-gray-400 text-xs">
                          {new Date(study.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {study.isFeatured && (
                    <Badge color="yellow">Featured</Badge>
                  )}
                  <Badge color={study.isPublished ? "blue" : "gray"}>
                    {study.isPublished ? "published" : "draft"}
                  </Badge>
                  <div className="flex space-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() =>
                        navigate(`/case-studies/edit/${study.slug ?? study.id}`)
                      }
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(study.id)}
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

export default CaseStudyListPage;