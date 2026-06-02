export interface BlogPost {
  id: number;
  title: string;
  author?: string;
  date?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status?: string;
  isFeatured?: boolean;
  featuredImage?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateBlogParams {
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status?: string;
  isFeatured?: boolean;
  featuredImage?: File;
  tags?: string[];
}

export interface UpdateBlogParams {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status?: string;
  isFeatured?: boolean;
  featuredImage?: File;
  tags?: string[];
}

export declare function getBlogs(
  params?: GetBlogsParams,
): Promise<{ data: BlogPost[]; pagination: BlogPagination }>;
export declare function getBlog(id: number | string): Promise<BlogPost>;
export declare function createBlog(
  params: CreateBlogParams,
): Promise<{ success: boolean; data: BlogPost }>;
export declare function updateBlog(
  id: number | string,
  params: UpdateBlogParams,
): Promise<{ success: boolean; data: BlogPost }>;
export declare function deleteBlog(
  id: number | string,
): Promise<{ success: boolean }>;
