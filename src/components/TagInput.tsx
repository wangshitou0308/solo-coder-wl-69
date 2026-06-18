import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Tag as TagIcon, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tag } from '../types';

interface TagInputProps {
  selectedTags: Tag[];
  allTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  onTagsChange?: (tags: Tag[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function TagInput({
  selectedTags,
  allTags,
  onAddTag,
  onRemoveTag,
  onTagsChange,
  placeholder = '输入标签名，回车或逗号添加…',
  allowCreate = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds = useMemo(
    () => new Set(selectedTags.map((t) => t.id)),
    [selectedTags]
  );

  const suggestions = useMemo(() => {
    const kw = inputValue.trim().toLowerCase();
    if (!kw) {
      return allTags.filter((t) => !selectedIds.has(t.id)).slice(0, 10);
    }
    return allTags
      .filter((t) => !selectedIds.has(t.id) && t.name.toLowerCase().includes(kw))
      .slice(0, 10);
  }, [inputValue, allTags, selectedIds]);

  const showDropdown = isFocused && suggestions.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onTagsChange?.(selectedTags);
  }, [selectedTags, onTagsChange]);

  useEffect(() => {
    if (highlightIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.querySelector<HTMLElement>(
        `[data-index="${highlightIndex}"]`
      );
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const addTagByName = (name: string) => {
    const trimmed = name.trim().replace(/,|，/g, '');
    if (!trimmed) return;

    const existing = allTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing && !selectedIds.has(existing.id)) {
      onAddTag(existing);
      setInputValue('');
      return;
    }

    if (existing && selectedIds.has(existing.id)) {
      setInputValue('');
      return;
    }

    if (allowCreate) {
      const colors = [
        '#C8102E',
        '#3A7D44',
        '#B8860B',
        '#4A6FA5',
        '#8B5CF6',
        '#EC4899',
        '#06B6D4',
        '#F97316',
      ];
      const newTag: Tag = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        color: colors[Math.floor(Math.random() * colors.length)],
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      onAddTag(newTag);
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        onAddTag(suggestions[highlightIndex]);
        setInputValue('');
        setHighlightIndex(-1);
      } else {
        addTagByName(inputValue);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightIndex(-1);
      return;
    }

    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      onRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  const handleSuggestionClick = (tag: Tag) => {
    onAddTag(tag);
    setInputValue('');
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg border-2 p-2 transition-all cursor-text',
          isFocused
            ? 'border-cinnabar-500 bg-rice-50 shadow-[0_0_0_4px_rgba(200,16,46,0.1)]'
            : 'border-rice-300 bg-rice-50/60 hover:border-cinnabar-300'
        )}
      >
        <TagIcon className="ml-1 h-4 w-4 shrink-0 text-cinnabar-500" />

        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color,
              border: `1px solid ${tag.color}40`,
            }}
          >
            # {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag.id);
              }}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/10"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-ink-800 outline-none placeholder:text-ink-400"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => addTagByName(inputValue)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cinnabar-500 text-rice-50 transition-colors hover:bg-cinnabar-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-rice-200 bg-rice-50 py-1 shadow-chinese-lg',
            'animate-scroll-reveal'
          )}
        >
          {inputValue && (
            <div className="flex items-center gap-1.5 border-b border-rice-100 px-3 py-1.5 text-xs text-ink-400">
              <Search className="h-3 w-3" />
              <span>
                找到 {suggestions.length} 个匹配标签
              </span>
            </div>
          )}
          {suggestions.map((tag, idx) => (
            <button
              key={tag.id}
              type="button"
              data-index={idx}
              onClick={() => handleSuggestionClick(tag)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors',
                idx === highlightIndex
                  ? 'bg-cinnabar-50'
                  : 'hover:bg-rice-100'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium text-ink-800">{tag.name}</span>
                <span className="text-xs text-ink-400">
                  已使用 {tag.usageCount} 次
                </span>
              </div>
              {idx === highlightIndex && (
                <span className="text-xs text-cinnabar-600">回车选择</span>
              )}
            </button>
          ))}
        </div>
      )}

      {allowCreate && inputValue && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gold-200 bg-gold-50 p-2 text-center text-xs text-gold-700 shadow-chinese">
          按回车创建新标签「{inputValue.trim().replace(/,|，/g, '')}」
        </div>
      )}
    </div>
  );
}
