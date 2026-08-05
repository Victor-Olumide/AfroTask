import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Link2,
} from "lucide-react";

export default function EditorToolbar({ editor }) {
  if (!editor) return null;

  const preventFocus = (e) => e.preventDefault();

  const btn = (active = false) =>
    `flex h-9 w-9 items-center justify-center rounded-md transition
     ${
       active
         ? "bg-emerald-600 text-white"
         : "text-slate-300 hover:bg-slate-700 hover:text-white"
     }
     disabled:cursor-not-allowed disabled:opacity-40`;

  // Determine current active heading or default to paragraph
  const currentBlock = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : editor.isActive("heading", { level: 4 })
    ? "h4"
    : "paragraph";

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-900 px-3 py-2">

      {/* Undo / Redo */}
      <button
        type="button"
        onMouseDown={preventFocus}
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        className={btn()}
        title="Undo"
      >
        <Undo2 size={18} />
      </button>

      <button
        type="button"
        onMouseDown={preventFocus}
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        className={btn()}
        title="Redo"
      >
        <Redo2 size={18} />
      </button>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      {/* Paragraph / Heading Select */}
      <select
        value={currentBlock}
        onChange={(e) => {
          const value = e.target.value;

          if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else if (value.startsWith("h")) {
            const level = parseInt(value.replace("h", ""), 10);
            // ✅ Correct TipTap API method: toggleHeading
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      {/* Text Formatting */}
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic size={18} />
      </button>

      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive("underline"))}
        title="Underline"
      >
        <Underline size={18} />
      </button>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      {/* Lists */}
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      {/* Quote */}
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>

      {/* Code Block */}
      <button
        type="button"
        onMouseDown={preventFocus}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btn(editor.isActive("codeBlock"))}
        title="Code Block"
      >
        <Code size={18} />
      </button>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      {/* Link */}
      <button
        type="button"
        onMouseDown={preventFocus}
        className={btn(editor.isActive("link"))}
        title="Add / Edit Link"
        onClick={() => {
          const { empty } = editor.state.selection;

          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Enter URL", previousUrl || "");

          if (url === null) return;

          if (!url.trim()) {
            editor.chain().focus().unsetLink().run();
            return;
          }

          if (!empty) {
            editor.chain().focus().setLink({ href: url }).run();
          } else {
            const text = window.prompt("Display text", url);
            if (!text) return;
            editor
              .chain()
              .focus()
              .insertContent(
                `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
              )
              .run();
          }
        }}
      >
        <Link2 size={18} />
      </button>
    </div>
  );
}