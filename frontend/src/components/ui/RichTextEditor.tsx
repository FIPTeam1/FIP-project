'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[13px] font-medium transition-colors select-none ${
        active
          ? 'bg-[#5555FF] text-white'
          : 'text-[#374151] hover:bg-[#F3F4F6]'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your recipe instructions here...',
  minHeight = 220,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: 'recipe-prose outline-none px-4 py-3',
        style: `min-height: ${minHeight}px;`,
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML && value !== (currentHTML === '<p></p>' ? '' : currentHTML)) {
      editor.commands.setContent(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (label: string, title: string, onClick: () => void, active: boolean) => (
    <ToolbarButton key={label} onClick={onClick} active={active} title={title}>
      {label}
    </ToolbarButton>
  );

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white focus-within:border-[#5555FF] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 px-3 py-2 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        {btn('B', 'Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {btn('I', 'Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}

        <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

        {btn('H2', 'Heading 2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {btn('H3', 'Heading 3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}

        <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

        {btn('1.', 'Numbered List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {btn('•', 'Bullet List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}

        <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

        <ToolbarButton
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false}
        >
          ✕ clear
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
