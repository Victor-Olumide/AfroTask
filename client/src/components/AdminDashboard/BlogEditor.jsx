import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import EditorToolbar from "./EditorToolbar";
import "./BlogEditor.css";

export default function BlogEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4], // Ensure H1, H2, H3, H4 tags are explicitly supported
        },
      }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your story...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "",

    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none text-lg focus:outline-none min-h-[400px]",
      },
      parseOptions: {
        preserveWhitespace: "full",
      },
    },

    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value with editor content when editing existing posts
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="relative flex flex-col h-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <EditorToolbar editor={editor} />
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-h-[600px]">
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}