import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

interface RichTextEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content = '',
  onUpdate,
  placeholder = 'Start writing your thoughts...',
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border rounded-lg', className)}>
      {editable && (
        <>
          <div className="flex flex-wrap items-center gap-1 p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('bold') && 'bg-muted'
              )}
            >
              <Bold className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('italic') && 'bg-muted'
              )}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('heading', { level: 1 }) && 'bg-muted'
              )}
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('heading', { level: 2 }) && 'bg-muted'
              )}
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('heading', { level: 3 }) && 'bg-muted'
              )}
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('bulletList') && 'bg-muted'
              )}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('orderedList') && 'bg-muted'
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'h-8 px-2',
                editor.isActive('blockquote') && 'bg-muted'
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 px-2"
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 px-2"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 focus:outline-none min-h-[200px]"
      />
    </div>
  );
}
