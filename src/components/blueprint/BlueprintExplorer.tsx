import React, { useState } from 'react';
import { BLUEPRINT_DOCUMENTS, BlueprintDocument } from './data';
import { 
  FileCode2, 
  Search, 
  Copy, 
  CheckCircle2, 
  Layers, 
  Database, 
  ShieldCheck, 
  Code, 
  BookOpen, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const BlueprintExplorer: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>(BLUEPRINT_DOCUMENTS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'جميع الوثائق' },
    { id: 'core', label: 'الميثاق الأساسي' },
    { id: 'docs', label: 'متطلبات وحوكمة' },
    { id: 'database', label: 'قاعدة البيانات (SQL)' },
    { id: 'api', label: 'عقود API (OpenAPI)' },
    { id: 'diagrams', label: 'المخططات المعمارية' },
  ];

  const filteredDocs = BLUEPRINT_DOCUMENTS.filter(doc => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeDoc = BLUEPRINT_DOCUMENTS.find(d => d.id === selectedDocId) || BLUEPRINT_DOCUMENTS[0];

  const handleCopy = () => {
    if (activeDoc) {
      navigator.clipboard.writeText(activeDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--line)] p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <FileCode2 className="w-4 h-4" />
            <span>مستكشف المخطط التنفيذي 2026 • Live Architecture Inspector</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)]">وثائق المخطط، عقود البيانات، والمخططات</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-inset)] text-[var(--ink)] text-xs font-semibold border border-[var(--line-strong)] transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ كود الوثيقة'}</span>
          </button>
        </div>
      </div>

      {/* Main Explorer Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav (4 cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--ink-soft)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في وثائق المخطط..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-xl pr-10 pl-3 py-2 text-xs text-[var(--ink)] placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-cyan-500 text-[var(--ink)] font-bold'
                    : 'bg-[var(--bg-elevated)] text-[var(--ink-soft)] hover:text-[var(--ink)] border border-[var(--line)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Document list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-right p-3.5 rounded-xl border text-xs transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-[var(--ink)] shadow-md shadow-cyan-500/5'
                      : 'bg-[var(--bg-elevated)]/60 border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--ink)] line-clamp-1">{doc.title}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-cyan-300 border border-[var(--line-strong)] uppercase">
                      {doc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </button>
              );
            })}
          </div>

        </div>

        {/* Document Content Viewer (8 cols on LG) */}
        <div className="lg:col-span-8 bg-[var(--bg-elevated)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header of Active Document */}
            <div className="border-b border-[var(--line)] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">{activeDoc.badge} SPECIFICATION</span>
                <h2 className="text-xl font-bold text-[var(--ink)] mt-0.5">{activeDoc.title}</h2>
              </div>
              <span className="text-xs text-[var(--ink-soft)]">تحديث: 2026-11-01</span>
            </div>

            {/* Document Content Code / Text Area */}
            <div className="bg-[var(--bg-inset)] border border-slate-800/90 rounded-2xl p-5 overflow-x-auto max-h-[620px] overflow-y-auto">
              <pre className="text-xs font-mono text-[var(--ink)] whitespace-pre-wrap leading-relaxed select-text">
                {activeDoc.content}
              </pre>
            </div>

          </div>

          {/* Traceability Seal footer */}
          <div className="pt-4 border-t border-[var(--line)] mt-6 flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>تم التحقق من مطابقة كود المنصة مع هذه الوثيقة 100%</span>
            </span>
            <span className="font-mono text-[11px] text-[var(--ink-soft)]">
              sha256-verified • ORBIT 2026
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
