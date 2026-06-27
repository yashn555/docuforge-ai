import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import type { Level } from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiLink,
  FiType,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = ''
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>;
  }

  const toggleMark = (mark: string) => {
    editor.chain().focus().toggleMark(mark).run();
  };


  const setTextAlign = (align: string) => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const setHeading = (level: Level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
          {/* Headings */}
          <button
            onClick={() => setHeading(1)}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-xs ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => setHeading(2)}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-xs ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => setHeading(3)}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-xs ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 3"
          >
            H3
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Text formatting */}
          <button
            onClick={() => toggleMark('bold')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Bold"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleMark('italic')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Italic"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleMark('underline')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-200' : ''
            }`}
            title="Underline"
          >
            <FiUnderline className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Alignment */}
          <button
            onClick={() => setTextAlign('left')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Left"
          >
            <FiAlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Center"
          >
            <FiAlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('right')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Right"
          >
            <FiAlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('justify')}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''
            }`}
            title="Justify"
          >
            <FiAlignJustify className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Link */}
          <button
            onClick={toggleLink}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-200' : ''
            }`}
            title="Add Link"
          >
            <FiLink className="w-4 h-4" />
          </button>
        </div>
      )}

      <EditorContent 
        editor={editor} 
        className={`prose max-w-none p-4 min-h-[200px] ${readOnly ? 'cursor-default' : ''}`}
      />
    </div>
  );
};

export default RichTextEditor;