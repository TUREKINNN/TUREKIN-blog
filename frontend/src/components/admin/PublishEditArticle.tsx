import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Image as ImageIcon, Eye, Upload, X, Bold, Italic, Code, Link2, List } from 'lucide-react';
import { useArticles } from '@/context/ArticleContext';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Article } from '@/types';

const DEFAULT_TAGS = ['React', 'TypeScript', '前端', '性能优化', 'Web Vitals', 'Tailwind CSS', 'Node.js', 'CSS'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

async function uploadArticleImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/uploads/article-image', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message);
    return json.data.url as string;
  } catch {
    return null;
  }
}

function ArticleForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const articleId = id ? parseInt(id) : NaN;
  const navigate = useNavigate();
  const { getArticle, createArticle, updateArticle } = useArticles();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditing);
  const [existingArticle, setExistingArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [availCategories, setAvailCategories] = useState<string[]>(['Project','Hermes','周热点','杂谈','开发者说']);
  const [coverImage, setCoverImage] = useState('');
  const [coverImageError, setCoverImageError] = useState('');
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/config/about').then(r => r.json()).then(j => {
      if (j.success && j.data?.categories) {
        try { setAvailCategories(JSON.parse(j.data.categories)); } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing || isNaN(articleId)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getArticle(articleId).then((result) => {
      if (cancelled) return;
      setExistingArticle(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isEditing, articleId, getArticle]);

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSummary(existingArticle.summary);
      setContent(existingArticle.content);
      setTags(existingArticle.tags);
      setCategory(existingArticle.category || null);
      setCoverImage(existingArticle.coverImage || '');
    }
  }, [existingArticle]);

  const handleAddTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  }, [tags]);

  const uploadCoverToServer = useCallback(async (file: File): Promise<string | null> => {
    setCoverUploading(true);
    setCoverImageError('');
    const url = await uploadArticleImage(file);
    setCoverUploading(false);
    if (!url) {
      setCoverImageError('封面上传失败，请重试');
    }
    return url;
  }, []);

  const handleCoverFile = useCallback(async (file: File) => {
    setCoverImageError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCoverImageError('不支持的文件格式，仅支持 JPG、PNG、WebP、GIF');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setCoverImageError('文件大小不能超过 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    const url = await uploadCoverToServer(file);
    if (url) setCoverImage(url);
  }, [uploadCoverToServer]);

  const handleCoverInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleCoverFile(f);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }, [handleCoverFile]);

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleCoverFile(f);
  }, [handleCoverFile]);

  const handleContentImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setMessage({ type: 'error', text: '不支持的图片格式' });
      return;
    }
    if (f.size > MAX_IMAGE_SIZE) {
      setMessage({ type: 'error', text: '图片不能超过 10MB' });
      return;
    }

    setImageUploading(true);
    const uploadedUrl = await uploadArticleImage(f);
    if (!uploadedUrl) {
      setMessage({ type: 'error', text: '图片上传失败' });
      setImageUploading(false);
      return;
    }

    const markdownImg = `\n![${f.name}](${uploadedUrl})\n`;
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const newContent = before + markdownImg + after;
      setContent(newContent);
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = start + markdownImg.length;
        ta.selectionEnd = start + markdownImg.length;
      }, 50);
    } else {
      setContent(content + markdownImg);
    }

    setImageUploading(false);
    if (contentImageInputRef.current) contentImageInputRef.current.value = '';
  }, [content]);

  const insertMarkdown = useCallback((syntax: string, placeholder: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent(content + syntax + placeholder + syntax);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newContent = before + syntax + selected + syntax + after;
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      const sel = selected === placeholder ? start + syntax.length : start + syntax.length;
      const selEnd = selected === placeholder ? sel + placeholder.length : sel + selected.length;
      ta.selectionStart = sel;
      ta.selectionEnd = selEnd;
    }, 50);
  }, [content]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '标题和内容不能为空' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const articleData = {
      title: title.trim(),
      summary: summary.trim() || content.trim().slice(0, 150) + '...',
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['未分类'],
      coverImage: coverImage.trim() || null,
      category: category,
    };

    try {
      if (isEditing) {
        const result = await updateArticle(articleId, articleData);
        if (result) {
          setMessage({ type: 'success', text: '文章修改成功！' });
          setTimeout(() => navigate(`/article/${articleId}`), 800);
        } else {
          setMessage({ type: 'error', text: '修改失败：权限不足或文章不存在' });
        }
      } else {
        const result = await createArticle(articleData);
        if (result) {
          setMessage({ type: 'success', text: '文章发布成功！' });
          setTimeout(() => navigate(`/article/${result.id}`), 800);
        } else {
          setMessage({ type: 'error', text: '发布失败：权限不足' });
        }
      }
    } finally {
      setSaving(false);
    }
  }, [title, summary, content, tags, coverImage, category, isEditing, articleId, createArticle, updateArticle, navigate]);

  const handleBack = useCallback(() => {
    // 智能返回：有历史记录就回退，否则去首页
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const subtitle = loading ? '加载中...' : isEditing ? '编辑文章' : '发布新文章';

  return (
    <div className="animate-slide-up article-detail">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-dark-500 hover:text-dark-800 transition-colors text-sm bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <Eye size={14} />
          {preview ? '编辑' : '预览'}
        </button>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-apple-dark dark:text-white mb-6">
        {subtitle}
      </h1>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {preview ? (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-apple-dark dark:text-white mb-2">{title || '未命名文章'}</h2>
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-48 object-cover rounded-xl mb-4" />
          ) : (
            <div className="w-full h-32 rounded-xl mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <ImageIcon size={32} className="text-gray-300 dark:text-gray-600" />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t) => <span key={t} className="tag text-xs">{t}</span>)}
          </div>
          <p className="text-sm text-apple-gray dark:text-apple-dark-gray mb-4">{summary}</p>
          <div className="prose max-w-none dark:text-apple-dark-gray">
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-apple-dark-gray leading-relaxed">
              {content || '（正文内容将在此处显示）'}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">文章标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-apple-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">文章摘要</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简短描述文章内容（留空则自动截取正文前150字）"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-apple-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
              封面图片 {!coverImage && <span className="text-apple-lightgray font-normal">（可选）</span>}
              {coverUploading && <span className="text-blue-500 ml-1">上传中...</span>}
            </label>

            {coverImage ? (
              <div className="space-y-2">
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img src={coverImage} alt="封面预览" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="移除封面"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                  onDragLeave={() => setCoverDragOver(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    coverDragOver
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <Upload size={28} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    点击或拖拽上传封面图片
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    JPG/PNG/WebP/GIF，最大 10MB
                  </p>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs text-apple-lightgray mb-1">
                    <span>或输入图片 URL：</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-apple-lightgray dark:text-apple-dark-lightgray flex-shrink-0" />
                    <input
                      type="url"
                      value={coverImage.startsWith('data:') ? '' : coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-apple-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverInputChange}
                  className="hidden"
                />
              </>
            )}

            {coverImageError && (
              <p className="mt-1 text-xs text-red-500">{coverImageError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">标签</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="inline-flex items-center gap-1 tag active cursor-pointer"
                >
                  {tag} ×
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="输入标签后按回车添加"
                maxLength={20}
                className="flex-1 px-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-apple-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-apple-gray dark:text-apple-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {DEFAULT_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { if (tags.length < 8) setTags([...tags, tag]); }}
                  className="tag text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-xs font-medium text-dark-500 mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {[null, ...availCategories].map(cat => (
                <button key={cat ?? 'none'} type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${category === cat
                      ? 'bg-accent-500/15 text-accent-400 border-accent-400/30'
                      : 'bg-white/[0.03] text-dark-500 border-white/[0.06] hover:border-white/[0.12]'}`}>
                  {cat ?? '未分类'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-dark dark:text-apple-dark-gray mb-1.5">
              文章内容 *（支持 Markdown）
            </label>

            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <span className="text-xs text-apple-lightgray mr-1">快速插入：</span>
              <button type="button" onClick={() => insertMarkdown('**', '粗体文字')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-apple-dark dark:hover:text-white transition-colors" title="粗体"><Bold size={14} /></button>
              <button type="button" onClick={() => insertMarkdown('*', '斜体文字')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-apple-dark dark:hover:text-white transition-colors" title="斜体"><Italic size={14} /></button>
              <button type="button" onClick={() => insertMarkdown('\n```\n', '代码块')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-apple-dark dark:hover:text-white transition-colors" title="代码块"><Code size={14} /></button>
              <button type="button" onClick={() => insertMarkdown('[', '链接文字](https://)')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-apple-dark dark:hover:text-white transition-colors" title="超链接"><Link2 size={14} /></button>
              <button type="button" onClick={() => insertMarkdown('\n- ', '列表项')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-apple-dark dark:hover:text-white transition-colors" title="无序列表"><List size={14} /></button>
              <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button type="button" onClick={() => contentImageInputRef.current?.click()} disabled={imageUploading} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="插入图片"><ImageIcon size={13} />{imageUploading ? '上传中...' : '插入图片'}</button>
              <input ref={contentImageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleContentImageUpload} className="hidden" />
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="使用 Markdown 语法编写文章内容..."
              rows={18}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-apple-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y min-h-[300px]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-apple-lightgray dark:text-apple-dark-lightgray">
              {isEditing ? '修改后点击保存' : '发布者：'} {user?.displayName}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? '保存中...' : isEditing ? '保存修改' : '发布文章'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PublishEditArticleContent() {
  const { siteOwnerDisplayName } = useAuth();

  return (
    <>
      <Helmet>
        <title>{`发布文章 - ${siteOwnerDisplayName}のblog`}</title>
      </Helmet>
      <ArticleForm />
    </>
  );
}

export default function PublishEditArticle() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PublishEditArticleContent />
    </ProtectedRoute>
  );
}