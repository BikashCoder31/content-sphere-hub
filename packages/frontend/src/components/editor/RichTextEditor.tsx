import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import type { JSONContent } from '@tiptap/core';
import { useCallback, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { MediaPickerModal } from '@/components/media';
import type { MediaItem } from '@/store/api/mediaApi';
import { cn } from '@/lib/utils';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export interface RichTextEditorProps {
  content?: JSONContent;
  placeholder?: string;
  onChange?: (content: JSONContent) => void;
  onHtmlChange?: (html: string) => void;
  onTextChange?: (text: string) => void;
  onWordCountChange?: (count: number) => void;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export interface RichTextEditorRef {
  getEditor: () => Editor | null;
  getContent: () => JSONContent;
  getHtml: () => string;
  getText: () => string;
  getWordCount: () => number;
  setContent: (content: JSONContent) => void;
  focus: () => void;
  clear: () => void;
}

/**
 * Calculate word count from text
 */
function calculateWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Rich Text Editor component using TipTap
 */
export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      content,
      placeholder = 'Start writing...',
      onChange,
      onHtmlChange,
      onTextChange,
      onWordCountChange,
      editable = true,
      className,
      autoFocus = false,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false, // Using CodeBlockLowlight instead
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline hover:text-blue-800',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-lg',
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full',
          },
        }),
        TableRow,
        TableCell.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 dark:border-gray-600 p-2',
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 font-bold',
          },
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto',
          },
        }),
      ],
      content,
      editable,
      autofocus: autoFocus,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base dark:prose-invert max-w-none',
            'focus:outline-none min-h-[300px] px-4 py-3',
            'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
            'prose-p:text-gray-700 dark:prose-p:text-gray-300',
            'prose-a:text-blue-600 dark:prose-a:text-blue-400',
            'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
            'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded',
            'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600',
            'prose-ul:list-disc prose-ol:list-decimal'
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        const html = editor.getHTML();
        const text = editor.getText();
        const wordCount = calculateWordCount(text);

        onChange?.(json);
        onHtmlChange?.(html);
        onTextChange?.(text);
        onWordCountChange?.(wordCount);
      },
    });

    // Update content when prop changes
    useEffect(() => {
      if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }, [editor, content]);

    // Update editable state
    useEffect(() => {
      if (editor) {
        editor.setEditable(editable);
      }
    }, [editor, editable]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getContent: () => editor?.getJSON() || { type: 'doc', content: [] },
      getHtml: () => editor?.getHTML() || '',
      getText: () => editor?.getText() || '',
      getWordCount: () => calculateWordCount(editor?.getText() || ''),
      setContent: (newContent: JSONContent) => {
        editor?.commands.setContent(newContent);
      },
      focus: () => {
        editor?.commands.focus();
      },
      clear: () => {
        editor?.commands.clearContent();
      },
    }));

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const handleMediaSelect = useCallback(
      (media: MediaItem | MediaItem[]) => {
        if (!editor) return;
        
        const item = Array.isArray(media) ? media[0] : media;
        if (item && item.mediaType === 'image') {
          // Use the medium variant or fall back to original
          const url = item.variants?.find((v) => v.name === 'medium')?.url || item.url;
          editor.chain().focus().setImage({ src: url, alt: item.alt || item.originalName }).run();
        }
      },
      [editor]
    );

    const setLink = useCallback(() => {
      if (!editor) return;

      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);

      if (url === null) return;

      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
      if (!editor) return;
      setShowMediaPicker(true);
    }, [editor]);

    const insertTable = useCallback(() => {
      if (!editor) return;

      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className={cn('border rounded-lg overflow-hidden bg-white dark:bg-gray-800', className)}>
        <EditorToolbar
          editor={editor}
          onSetLink={setLink}
          onAddImage={addImage}
          onInsertTable={insertTable}
        />
        <EditorContent editor={editor} />
        
        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
          selectionMode="single"
          mediaType="image"
          title="Insert Image"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
