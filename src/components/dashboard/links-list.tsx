"use client";

import { useState, useTransition } from "react";
import { Plus, Link2, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { addBlockAction, editBlockAction, removeBlockAction } from "@/server/actions/blocks";
import { MAX_LINKS_PER_PAGE } from "@/lib/limits";

type LinkBlock = {
  id: string;
  title: string;
  url: string;
  position: number;
};

export function LinksList({ initialLinks }: { initialLinks: LinkBlock[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBlock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (link?: LinkBlock) => {
    if (link) {
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url);
    } else {
      setEditingLink(null);
      setTitle("");
      setUrl("");
    }
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setError(null);
      setFieldErrors({});
    }, 200);
  };

  const handleSave = () => {
    setError(null);
    setFieldErrors({});
    
    startTransition(async () => {
      const payload = { title, url };
      
      let res;
      if (editingLink) {
        res = await editBlockAction(editingLink.id, payload);
      } else {
        res = await addBlockAction(payload);
      }

      if (res.ok) {
        handleCloseModal();
      } else {
        setError(res.message || "An error occurred");
        if ("fieldErrors" in res && res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await removeBlockAction(id);
      if (res.ok) {
        setDeleteId(null);
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 -mt-[5.5rem] relative z-10 pointer-events-none">
        <div className="flex-1"></div>
        <button
          onClick={() => handleOpenModal()}
          disabled={isPending || initialLinks.length >= MAX_LINKS_PER_PAGE}
          className="inline-flex items-center justify-center gap-2 bg-ink text-cream hover:bg-ink/90 font-bold text-sm sm:text-base py-3 px-6 rounded-full transition-colors mb-1 pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>Add link</span>
        </button>
      </div>

      <div className="mt-12 flex justify-between items-center mb-4">
        <h2 className="font-heading font-bold text-xl text-ink">Links</h2>
        <div className="text-sm font-bold text-ink/60">
          {initialLinks.length} / {MAX_LINKS_PER_PAGE} links
        </div>
      </div>
      
      {initialLinks.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No links yet"
          description="Add links to your profile to share them with your audience."
          action={{
            label: "Add your first link",
            onClick: () => handleOpenModal(),
          }}
        />
      ) : (
        <div className="space-y-4">
          {initialLinks.map((link) => (
            <Card key={link.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate text-sm sm:text-base">{link.title}</p>
                <p className="text-ink/60 text-xs sm:text-sm truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleOpenModal(link)}
                  className="p-2 text-ink/50 hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
                  aria-label={`Edit ${link.title}`}
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeleteId(link.id)}
                  className="p-2 text-ink/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete ${link.title}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-xl mb-2 text-ink">Delete this link?</h3>
            <p className="text-ink/70 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isPending}
                className="px-4 py-2 font-bold text-ink hover:bg-ink/5 rounded-full transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="px-4 py-2 font-bold text-cream bg-red-600 hover:bg-red-700 rounded-full transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={handleCloseModal} />
          <Card className="w-full max-w-md p-0 shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-heading font-bold text-xl text-ink">
                {editingLink ? "Edit link" : "Add link"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-ink/50 hover:text-ink hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="p-3 mb-6 text-sm text-red-700 bg-red-50 rounded-xl" role="alert" aria-live="polite">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="link-title" className="block text-sm font-bold text-ink/70 mb-1">
                    Title
                  </label>
                  <input
                    id="link-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-ink/10 focus:border-ink rounded-xl text-ink outline-none transition-colors"
                    placeholder="My Portfolio"
                    aria-invalid={!!fieldErrors.title}
                    aria-describedby={fieldErrors.title ? "title-error" : undefined}
                    disabled={isPending}
                  />
                  {fieldErrors.title && (
                    <p id="title-error" className="mt-1 text-xs text-red-600 font-medium">
                      {fieldErrors.title[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="link-url" className="block text-sm font-bold text-ink/70 mb-1">
                    URL
                  </label>
                  <input
                    id="link-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-ink/10 focus:border-ink rounded-xl text-ink outline-none transition-colors"
                    placeholder="example.com"
                    aria-invalid={!!fieldErrors.url}
                    aria-describedby={fieldErrors.url ? "url-error" : "url-hint"}
                    disabled={isPending}
                  />
                  {fieldErrors.url ? (
                    <p id="url-error" className="mt-1 text-xs text-red-600 font-medium">
                      {fieldErrors.url[0]}
                    </p>
                  ) : (
                    <p id="url-hint" className="mt-1 text-xs text-ink/50 font-medium">
                      Starts with https://
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-ink/10 flex justify-end gap-3 bg-ink/5 rounded-b-2xl">
              <button
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-6 py-3 font-bold text-ink hover:bg-ink/5 rounded-full transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-6 py-3 font-bold text-cream bg-ink hover:bg-ink/90 rounded-full transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
