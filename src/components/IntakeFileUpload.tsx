"use client";

import { useRef, useState } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";
import { addUploadedFile, removeUploadedFile, type UploadedFile } from "@/lib/orders";
import { FileIcon, UploadCloudIcon, XIcon, CheckIcon } from "@/components/icons";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT_ATTR = "image/*,application/pdf,.docx";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  uploaded?: UploadedFile;
  task?: UploadTask;
  storagePath?: string;
};

function isAcceptedType(file: File) {
  return file.type.startsWith("image/") || ACCEPTED_TYPES.includes(file.type);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export default function IntakeFileUpload({ orderId }: { orderId: string }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const room = MAX_FILES - items.length;
    const toAdd = incoming.slice(0, Math.max(room, 0));

    for (const file of toAdd) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      if (file.size >= MAX_SIZE_BYTES) {
        setItems((prev) => [
          ...prev,
          { id, name: file.name, size: file.size, progress: 0, status: "error", error: "File is over 10MB" },
        ]);
        continue;
      }
      if (!isAcceptedType(file)) {
        setItems((prev) => [
          ...prev,
          { id, name: file.name, size: file.size, progress: 0, status: "error", error: "Unsupported file type" },
        ]);
        continue;
      }

      const storagePath = `orders/${orderId}/uploads/${Date.now()}_${sanitizeFileName(file.name)}`;
      const storageRef = ref(getFirebaseStorage(), storagePath);
      const task = uploadBytesResumable(storageRef, file);

      setItems((prev) => [
        ...prev,
        { id, name: file.name, size: file.size, progress: 0, status: "uploading", task, storagePath },
      ]);

      task.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          updateItem(id, { progress });
        },
        (err) => {
          updateItem(id, { status: "error", error: err.message });
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            const uploaded: UploadedFile = {
              name: file.name,
              url,
              size: file.size,
              uploadedAt: new Date().toISOString(),
            };
            await addUploadedFile(orderId, uploaded);
            updateItem(id, { status: "done", progress: 100, uploaded });
          } catch (err) {
            updateItem(id, {
              status: "error",
              error: err instanceof Error ? err.message : "Could not finish upload",
            });
          }
        }
      );
    }
  }

  async function handleRemove(item: UploadItem) {
    if (item.status === "uploading") {
      item.task?.cancel();
    } else if (item.status === "done" && item.uploaded) {
      try {
        if (item.storagePath) {
          await deleteObject(ref(getFirebaseStorage(), item.storagePath));
        }
        await removeUploadedFile(orderId, item.uploaded);
      } catch {
        // If deletion fails, still drop it from this list - not worth blocking the user.
      }
    }
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  }

  const atLimit = items.length >= MAX_FILES;

  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-headline">
        Reference files or brand assets (optional)
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!atLimit) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (!atLimit) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !atLimit && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
          atLimit
            ? "cursor-not-allowed border-border bg-panel opacity-60"
            : dragActive
              ? "border-accent bg-accent-tint"
              : "border-border bg-background"
        }`}
      >
        <UploadCloudIcon className="h-6 w-6 text-accent-text" />
        <p className="text-[12px] text-body">
          {atLimit
            ? `Maximum ${MAX_FILES} files reached`
            : "Drag and drop files here, or click to browse"}
        </p>
        <p className="text-[11px] text-muted">Images, PDF, or .docx — up to 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          disabled={atLimit}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-accent-text" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-headline">{item.name}</p>
                {item.status === "error" ? (
                  <p className="text-[11px] text-accent-text">{item.error}</p>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${item.status === "done" ? 100 : item.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted">{formatSize(item.size)}</span>
                  </div>
                )}
              </div>
              {item.status === "done" && <CheckIcon className="h-4 w-4 shrink-0 text-accent" />}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label="Remove file"
                className="shrink-0 text-muted hover:text-headline"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
