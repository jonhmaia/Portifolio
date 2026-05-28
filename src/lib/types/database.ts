// Database Types for Supabase

export type ProjectStatus = 'dev' | 'concluido' | 'pausado' | 'arquivado'
export type ArticleStatus = 'draft' | 'published'
export type TechnologyCategory = 'language' | 'framework' | 'lib' | 'db' | 'tool' | 'other'
export type Language = 'pt-BR' | 'en'

// Profiles table
export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  email: string | null
  github_url: string | null
  linkedin_url: string | null
  website_url: string | null
  updated_at: string
  created_at: string
}

// Technologies table
export interface Technology {
  id: number
  name: string
  slug: string
  icon_class: string | null
  color_hex: string
  category: TechnologyCategory
  is_active: boolean
  created_at: string
}

// Projects table
export interface Project {
  id: number
  title: string
  slug: string
  subtitle: string | null
  short_description: string | null
  full_description: string | null
  cover_image_url: string | null
  repo_url: string | null
  deploy_url: string | null
  is_featured: boolean
  display_order: number
  status: ProjectStatus
  is_active: boolean
  views_count: number
  language: Language
  meta_description: string | null
  meta_keywords: string[] | null
  created_at: string
  updated_at: string
}

// Project with relations
export interface ProjectWithRelations extends Project {
  technologies?: Technology[]
  images?: ProjectImage[]
  tags?: Tag[]
  articles?: Article[]
}

// Project Technologies junction table
export interface ProjectTechnology {
  project_id: number
  technology_id: number
}

// Project Images table
export interface ProjectImage {
  id: number
  project_id: number
  image_url: string
  caption: string | null
  display_order: number
  created_at: string
}

// Tags table
export interface Tag {
  id: number
  name: string
  slug: string
  color_hex: string
  created_at: string
}

// Project Tags junction table
export interface ProjectTag {
  project_id: number
  tag_id: number
}

// Categories table
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  color_hex: string
  display_order: number
  created_at: string
}

// Articles table
export interface Article {
  id: number
  title: string
  slug: string
  author_id: string
  content: string
  summary: string | null
  excerpt: string | null
  cover_image_url: string | null
  status: ArticleStatus
  views_count: number
  reading_time_minutes: number | null
  category_id: number | null
  language: Language
  meta_description: string | null
  meta_keywords: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// Article with relations
export interface ArticleWithRelations extends Article {
  author?: Profile
  category?: Category
  tags?: Tag[]
  projects?: Project[]
}

// Article Tags junction table
export interface ArticleTag {
  article_id: number
  tag_id: number
}

// Article Projects junction table
export interface ArticleProject {
  article_id: number
  project_id: number
}

// ===========================================
// TRANSLATION TABLES
// ===========================================

// Project Translations table
export interface ProjectTranslation {
  id: number
  project_id: number
  language: Language
  title: string
  subtitle: string | null
  short_description: string | null
  full_description: string | null
  meta_description: string | null
  diagrams?: any[] | null
  downloads?: any[] | null
  created_at: string
  updated_at: string
}

// Article Translations table
export interface ArticleTranslation {
  id: number
  article_id: number
  language: Language
  title: string
  content: string
  summary: string | null
  excerpt: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

// Category Translations table
export interface CategoryTranslation {
  id: number
  category_id: number
  language: Language
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
// Tag Translations table
export interface TagTranslation {
  id: number
  tag_id: number
  language: Language
  name: string
  created_at: string
  updated_at: string
}
// HomepageData table
export interface HomepageData {
  id: number
  avatar_url: string | null
  email: string
  github_url: string
  linkedin_url: string
  name_pt: string
  location_pt: string
  role_pt: string
  about_title_pt: string
  about_subtitle_pt: string
  bio_pt: string | null
  name_en: string
  location_en: string
  role_en: string
  about_title_en: string
  about_subtitle_en: string
  bio_en: string | null
  created_at: string
  updated_at: string
}

// Skill table
export interface Skill {
  id: number
  name: string
  progress: number
  color: string
  icon_type: 'url' | 'embed' | 'upload'
  icon_value: string | null
  display_order: number
  created_at: string
  updated_at: string
}

// ===========================================
// ENTITIES WITH TRANSLATIONS
// ===========================================

// Project with translations loaded
export interface ProjectWithTranslations extends Omit<Project, 'title' | 'subtitle' | 'short_description' | 'full_description' | 'meta_description'> {
  translations: {
    pt?: ProjectTranslation
    en?: ProjectTranslation
  }
}

// Article with translations loaded
export interface ArticleWithTranslations extends Omit<Article, 'title' | 'content' | 'summary' | 'excerpt' | 'meta_description'> {
  translations: {
    pt?: ArticleTranslation
    en?: ArticleTranslation
  }
}

// Category with translations loaded
export interface CategoryWithTranslations extends Omit<Category, 'name' | 'description'> {
  translations: {
    pt?: CategoryTranslation
    en?: CategoryTranslation
  }
}

// Tag with translations loaded
export interface TagWithTranslations extends Omit<Tag, 'name'> {
  translations: {
    pt?: TagTranslation
    en?: TagTranslation
  }
}

// Translation input types for forms
export interface ProjectTranslationInput {
  title: string
  subtitle?: string | null
  short_description?: string | null
  full_description?: string | null
  meta_description?: string | null
  diagrams?: any[] | null
  downloads?: any[] | null
}

export interface ArticleTranslationInput {
  title: string
  content: string
  summary?: string | null
  excerpt?: string | null
  meta_description?: string | null
}

export interface CategoryTranslationInput {
  name: string
  description?: string | null
}

export interface TagTranslationInput {
  name: string
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      technologies: {
        Row: Technology
        Insert: Omit<Technology, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Technology, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'views_count'> & { id?: number; created_at?: string; updated_at?: string; views_count?: number }
        Update: Partial<Omit<Project, 'id'>>
      }
      project_technologies: {
        Row: ProjectTechnology
        Insert: ProjectTechnology
        Update: Partial<ProjectTechnology>
      }
      project_images: {
        Row: ProjectImage
        Insert: Omit<ProjectImage, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<ProjectImage, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Tag, 'id'>>
      }
      project_tags: {
        Row: ProjectTag
        Insert: ProjectTag
        Update: Partial<ProjectTag>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Category, 'id'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'reading_time_minutes'> & { id?: number; created_at?: string; updated_at?: string; views_count?: number; reading_time_minutes?: number }
        Update: Partial<Omit<Article, 'id'>>
      }
      article_tags: {
        Row: ArticleTag
        Insert: ArticleTag
        Update: Partial<ArticleTag>
      }
      article_projects: {
        Row: ArticleProject
        Insert: ArticleProject
        Update: Partial<ArticleProject>
      }
      project_translations: {
        Row: ProjectTranslation
        Insert: Omit<ProjectTranslation, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ProjectTranslation, 'id'>>
      }
      article_translations: {
        Row: ArticleTranslation
        Insert: Omit<ArticleTranslation, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ArticleTranslation, 'id'>>
      }
      category_translations: {
        Row: CategoryTranslation
        Insert: Omit<CategoryTranslation, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<CategoryTranslation, 'id'>>
      }
      tag_translations: {
        Row: TagTranslation
        Insert: Omit<TagTranslation, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<TagTranslation, 'id'>>
      }
      homepage_data: {
        Row: HomepageData
        Insert: Partial<Omit<HomepageData, 'created_at' | 'updated_at'>> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<HomepageData, 'id'>>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Skill, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: ProjectStatus
      article_status: ArticleStatus
      technology_category: TechnologyCategory
      language: Language
    }
  }
}

// Helper types for API responses
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===========================================
// SUPABASE QUERY RESPONSE TYPES
// ===========================================

// Types for Supabase queries with relations
export interface ArticleTagRelation {
  tag: Tag
}

export interface ArticleProjectRelation {
  project: Pick<Project, 'id' | 'title' | 'slug'>
}

export interface ProjectTechnologyRelation {
  technology: Technology
}

export interface ProjectTagRelation {
  tag: Tag
}

// Article query response with relations
export interface ArticleQueryResponse extends Article {
  author: Profile | null
  category: Category | null
  tags?: ArticleTagRelation[]
  projects?: ArticleProjectRelation[]
  translations?: ArticleTranslation[]
}

// Project query response with relations
export interface ProjectQueryResponse extends Project {
  technologies?: ProjectTechnologyRelation[]
  tags?: ProjectTagRelation[]
  images?: ProjectImage[]
  translations?: ProjectTranslation[]
}

// Helper types for transformed data
export interface TransformedArticle extends Omit<ArticleQueryResponse, 'tags' | 'projects' | 'translations'> {
  tags?: Tag[]
  projects?: Pick<Project, 'id' | 'title' | 'slug'>[]
}

export interface TransformedProject extends Omit<ProjectQueryResponse, 'technologies' | 'tags' | 'translations'> {
  technologies?: Technology[]
  tags?: Tag[]
}