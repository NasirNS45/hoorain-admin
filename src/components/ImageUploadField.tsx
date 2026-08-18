import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api, mediaPreviewUrl } from "@/lib/api";
import type { MediaAsset, MediaFolder } from "@/types/api";

type ImageUploadFieldProps = {
  id: string;
  label: string;
  value: string;
  folder: MediaFolder;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
  multiple?: boolean;
  onChange: (value: string) => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export const ImageUploadField = ({
  id,
  label,
  value,
  folder,
  disabled = false,
  placeholder,
  hint,
  multiple = false,
  onChange,
}: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const previews = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = multiple ? Array.from(fileList) : fileList[0] ? [fileList[0]] : [];
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const asset = await api.upload<MediaAsset>(`/api/v1/media?folder=${folder}`, body);
        urls.push(asset.url);
      }
      if (multiple) {
        const existing = value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        onChange([...existing, ...urls].join("\n"));
      } else {
        onChange(urls[0] ?? "");
      }
      toast.success("Image uploaded.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not upload this image.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {multiple ? (
        <Textarea
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <Input
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        disabled={disabled || uploading}
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        {uploading
          ? "Uploading."
          : hint ?? "Paste a URL or choose a JPEG, PNG, WebP, or GIF. Maximum 8 MB."}
      </p>
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previews.slice(0, 8).map((src) => (
            <img
              key={src}
              src={mediaPreviewUrl(src)}
              alt=""
              className="h-20 w-20 border border-border object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
