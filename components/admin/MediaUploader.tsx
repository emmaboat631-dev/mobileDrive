'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, Loader2, AlertCircle, Image as ImageIcon, Box } from 'lucide-react';
import { uploadVehicleMedia, deleteVehicleMedia } from '@/lib/admin/media-actions';
import { toast } from '@/store/toastStore';
import { cn } from '@/lib/utils/cn';

type Kind = 'hero' | 'gallery' | 'model';

interface Props {
  vehicleId: string;
  kind: Kind;
  /** Current URLs — single hero/model string, or gallery array. */
  current: string | string[] | null | undefined;
  label?: string;
  hint?: string;
}

/**
 * Admin-only drag-and-drop uploader for vehicle media. Hero + model render
 * one file; gallery renders a grid with per-tile delete and an "add more"
 * dropzone. All writes go through server actions so RLS still applies.
 */
export function MediaUploader({ vehicleId, kind, current, label, hint }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const isGallery = kind === 'gallery';
  const items: string[] = isGallery
    ? (Array.isArray(current) ? current : [])
    : (typeof current === 'string' && current ? [current] : []);

  function pickFile() {
    inputRef.current?.click();
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    start(async () => {
      // For hero + model, replace. For gallery, append each.
      for (const file of Array.from(files).slice(0, isGallery ? 10 : 1)) {
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadVehicleMedia(vehicleId, kind, fd);
        if (!result.ok) {
          setError(result.message);
          toast.error('Upload failed', result.message);
          return;
        }
      }
      toast.success('Uploaded', isGallery ? `${files.length} image${files.length === 1 ? '' : 's'} added` : `${kind} replaced`);
      router.refresh();
    });
  }

  function onRemove(url: string) {
    if (!window.confirm('Remove this file? This can\'t be undone.')) return;
    start(async () => {
      const result = await deleteVehicleMedia(vehicleId, url);
      if (!result.ok) {
        toast.error('Delete failed', result.message);
        return;
      }
      toast.success('Removed');
      router.refresh();
    });
  }

  const accept = kind === 'model' ? '.glb,.gltf,model/gltf-binary,model/gltf+json' : 'image/*';

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">{label}</div>
            {hint && <div className="mt-0.5 text-[11px] text-ink-200">{hint}</div>}
          </div>
          <button
            type="button"
            onClick={pickFile}
            disabled={pending}
            className="btn-secondary text-xs disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {isGallery ? 'Add images' : items.length ? `Replace ${kind}` : `Upload ${kind}`}
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={isGallery}
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={pickFile}
          disabled={pending}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-ink-800/40 px-6 py-10 text-sm text-ink-200 transition hover:border-white/30 hover:bg-ink-800/70 disabled:opacity-50',
          )}
        >
          {kind === 'model' ? <Box className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
          <span>
            {kind === 'model' ? 'Drop a .glb or click to pick' : 'Drop image or click to pick'}
          </span>
          <span className="text-[11px] text-ink-300">Max 15 MB · JPG/PNG/WebP{kind === 'model' ? '/GLB' : ''}</span>
        </button>
      ) : isGallery ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((url) => (
            <GalleryTile key={url} url={url} onRemove={() => onRemove(url)} />
          ))}
          <button
            type="button"
            onClick={pickFile}
            disabled={pending}
            className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/15 bg-ink-800/40 text-ink-200 hover:border-white/30 disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
      ) : kind === 'model' ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-800/60 p-4">
          <Box className="h-5 w-5 text-ink-200" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">
              {items[0].split('/').pop()}
            </div>
            <a
              href={items[0]}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-ink-200 hover:text-white underline break-all"
            >
              {items[0]}
            </a>
          </div>
          <button
            type="button"
            onClick={() => onRemove(items[0])}
            disabled={pending}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-ink-800">
          <Image
            src={items[0]}
            alt="Hero"
            width={1200}
            height={600}
            className="h-auto w-full"
          />
          <button
            type="button"
            onClick={() => onRemove(items[0])}
            disabled={pending}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-ink-900/80 text-red-300 backdrop-blur hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function GalleryTile({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] bg-ink-800">
      <Image src={url} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-400/30 bg-ink-900/80 text-red-300 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-500/20"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
