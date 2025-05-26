// src/components/TiptapEditor.js
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const buttonBase = "btn btn-sm"; // Consistent base style

  return (
    <div className="mb-2 flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${buttonBase} ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline-secondary'}`}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${buttonBase} ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline-secondary'}`}
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonBase} ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline-secondary'}`}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonBase} ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline-secondary'}`}
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};


const TiptapEditor = ({ content, onChange, minHeight = '150px' }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  return (
    <div className="border rounded p-2">
      <div className="mb-2 pb-2 border-bottom">
        <MenuBar editor={editor} />
      </div>
      <div
        className="editor-content"
        style={{ minHeight: minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
