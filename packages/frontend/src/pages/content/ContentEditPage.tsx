import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { JSONContent } from '@tiptap/core';
import {
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useUpdateContentStatusMutation,
  useLazyCheckSlugQuery,
  type CreateContentInput,
  type UpdateContentInput,
} from '@/store/api';
import { RichTextEditor, type RichTextEditorRef } from '@/components/editor';
import { CategorySelect } from '@/components/content/CategorySelect';
import { TagSelect } from '@/components/content/TagSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner, LoadingScreen } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import {
  Save,
  Eye,
  Send,
  ArrowLeft,
  Settings,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { ContentStatus } from '@content-sphere-hub/shared';

// Form schema - using z.output to ensure defaults are applied
const contentFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z.string().optional(),
  excerpt: z.string().max(500, 'Excerpt is too long').optional(),
  contentType: z.enum(['article', 'page', 'post', 'news', 'tutorial', 'review', 'guide']),
  visibility: z.enum(['public', 'private', 'members_only', 'password_protected']),
  isFeatured: z.boolean(),
  allowComments: z.boolean(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().max(200).optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()),
  seo: z.object({
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }).optional(),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

export function ContentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const editorRef = useRef<RichTextEditorRef>(null);

  // State
  const [content, setContent] = useState<JSONContent>({ type: 'doc', content: [] });
  const [wordCount, setWordCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks
  const { data: existingContent, isLoading: isLoadingContent } = useGetContentByIdQuery(id!, {
    skip: isNew,
  });
  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [updateStatus] = useUpdateContentStatusMutation();
  const [checkSlug] = useLazyCheckSlugQuery();

  // Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      contentType: 'article',
      visibility: 'public',
      isFeatured: false,
      allowComments: true,
      featuredImage: '',
      featuredImageAlt: '',
      categoryId: null,
      tagIds: [],
      seo: {
        metaTitle: '',
        metaDescription: '',
      },
    },
  });

  const title = watch('title');
  const currentStatus = existingContent?.data.status;

  // Load existing content
  useEffect(() => {
    if (existingContent?.data) {
      const data = existingContent.data;
      // Map content type - ensure it's one of the valid form values
      const contentTypeMap: Record<string, ContentFormData['contentType']> = {
        article: 'article',
        page: 'page',
        post: 'post',
        news: 'news',
        tutorial: 'tutorial',
        review: 'review',
        guide: 'guide',
      };
      const visibilityMap: Record<string, ContentFormData['visibility']> = {
        public: 'public',
        private: 'private',
        members_only: 'members_only',
        password_protected: 'password_protected',
      };
      reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        contentType: contentTypeMap[data.contentType] || 'article',
        visibility: visibilityMap[data.visibility] || 'public',
        isFeatured: data.isFeatured,
        allowComments: data.allowComments,
        featuredImage: data.featuredImage || '',
        featuredImageAlt: data.featuredImageAlt || '',
        categoryId: data.category || null,
        tagIds: data.tags || [],
        seo: {
          metaTitle: data.seo?.metaTitle || '',
          metaDescription: data.seo?.metaDescription || '',
        },
      });
      setContent(data.content as JSONContent);
    }
  }, [existingContent, reset]);

  // Warn on unsaved changes
  useBeforeUnload(
    useCallback(
      (e) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
        }
      },
      [hasUnsavedChanges]
    )
  );

  // Mark as dirty when content changes
  const handleContentChange = useCallback((newContent: JSONContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
      setValue('slug', slug);
    }
  }, [title, isNew, setValue]);

  // Save content
  const saveContent = async (data: ContentFormData, status?: ContentStatus) => {
    try {
      setError(null);
      setSaveStatus('saving');

      const payload = {
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        content: content as object,
        contentType: data.contentType,
        visibility: data.visibility,
        isFeatured: data.isFeatured,
        allowComments: data.allowComments,
        featuredImage: data.featuredImage || undefined,
        featuredImageAlt: data.featuredImageAlt || undefined,
        category: data.categoryId || undefined,
        tags: data.tagIds?.length ? data.tagIds : undefined,
        seo: data.seo,
        status: status || (isNew ? 'draft' as ContentStatus : undefined),
      };

      if (isNew) {
        const result = await createContent(payload as CreateContentInput).unwrap();
        setSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        // Navigate to edit page for the new content
        navigate(`/dashboard/content/${result.data.id}/edit`, { replace: true });
      } else {
        await updateContent({ id: id!, data: payload as UpdateContentInput }).unwrap();
        setSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setSaveStatus('error');
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to save content'
      );
    }
  };

  // Handle form submit (save as draft)
  const onSubmit = (data: ContentFormData) => {
    saveContent(data);
  };

  // Save and publish
  const handlePublish = () => {
    handleSubmit((data) => saveContent(data, 'published'))();
  };

  // Update status only
  const handleStatusChange = async (newStatus: ContentStatus) => {
    if (!id || isNew) return;

    try {
      setError(null);
      await updateStatus({ id, data: { status: newStatus } }).unwrap();
    } catch (err) {
      setError(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          'Failed to update status'
      );
    }
  };

  // Check slug availability
  const handleCheckSlug = async (slug: string) => {
    if (!slug) return;
    try {
      const result = await checkSlug({ slug, excludeId: isNew ? undefined : id }).unwrap();
      if (!result.data.available && result.data.suggestion) {
        setValue('slug', result.data.suggestion);
      }
    } catch (err) {
      console.error('Failed to check slug:', err);
    }
  };

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (!isNew && isLoadingContent) {
    return <LoadingScreen />;
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/content')}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isNew ? 'New Content' : 'Edit Content'}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                {currentStatus && (
                  <span className="flex items-center gap-1">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        currentStatus === 'published' ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    {currentStatus.replace('_', ' ')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Error saving
                </>
              )}
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className="text-yellow-600 dark:text-yellow-400">Unsaved changes</span>
              )}
            </div>

            {/* Settings toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(showSettings && 'bg-gray-100 dark:bg-gray-700')}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Preview */}
            {!isNew && currentStatus === 'published' && existingContent?.data && (
              <a
                href={`/content/${existingContent.data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </a>
            )}

            {/* Save draft */}
            <Button
              variant="secondary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </Button>

            {/* Publish */}
            <Button onClick={handlePublish} disabled={isSaving}>
              <Send className="w-4 h-4 mr-2" />
              {currentStatus === 'published' ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* Error alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <Alert variant="error">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">Dismiss</button>
          </Alert>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Editor area */}
          <div className={cn('flex-1 transition-all', showSettings ? 'mr-80' : '')}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <Input
                {...register('title')}
                placeholder="Enter title..."
                className="text-2xl font-bold border-0 shadow-none focus:ring-0 bg-transparent px-0"
                error={errors.title?.message}
              />

              {/* Editor */}
              <RichTextEditor
                ref={editorRef}
                content={content}
                onChange={handleContentChange}
                onWordCountChange={setWordCount}
                placeholder="Start writing your content..."
                className="min-h-[500px]"
              />
            </form>
          </div>

          {/* Settings sidebar */}
          {showSettings && (
            <aside className="fixed right-0 top-[65px] bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug
                  </label>
                  <div className="flex gap-2">
                    <Input {...register('slug')} placeholder="url-slug" className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckSlug(watch('slug') || '')}
                    >
                      Check
                    </Button>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    {...register('excerpt')}
                    rows={3}
                    placeholder="Brief description..."
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <Controller
                    name="contentType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                      >
                        <option value="article">Article</option>
                        <option value="page">Page</option>
                        <option value="post">Post</option>
                        <option value="news">News</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="review">Review</option>
                        <option value="guide">Guide</option>
                      </select>
                    )}
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visibility
                  </label>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="members_only">Members Only</option>
                        <option value="password_protected">Password Protected</option>
                      </select>
                    )}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <CategorySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a category..."
                      />
                    )}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <Controller
                    name="tagIds"
                    control={control}
                    render={({ field }) => (
                      <TagSelect
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                        allowCreate
                      />
                    )}
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Featured Image URL
                  </label>
                  <Input
                    {...register('featuredImage')}
                    placeholder="https://..."
                    error={errors.featuredImage?.message}
                  />
                  {watch('featuredImage') && (
                    <img
                      src={watch('featuredImage')}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('isFeatured')} className="rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured content</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('allowComments')} className="rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Allow comments</span>
                  </label>
                </div>

                {/* SEO */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Meta Title ({watch('seo.metaTitle')?.length || 0}/70)
                      </label>
                      <Input
                        {...register('seo.metaTitle')}
                        placeholder="SEO title"
                        maxLength={70}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Meta Description ({watch('seo.metaDescription')?.length || 0}/160)
                      </label>
                      <textarea
                        {...register('seo.metaDescription')}
                        rows={2}
                        placeholder="SEO description"
                        maxLength={160}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Status actions (for existing content) */}
                {!isNew && currentStatus && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Status Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {currentStatus === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange('draft')}
                        >
                          Unpublish
                        </Button>
                      )}
                      {currentStatus === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange('pending_review')}
                        >
                          Submit for Review
                        </Button>
                      )}
                      {currentStatus !== 'archived' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange('archived')}
                        >
                          Archive
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentEditPage;
