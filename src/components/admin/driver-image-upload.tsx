"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { Upload } from "lucide-react";
import type { OurFileRouter } from "~/lib/uploadthing";

interface DriverImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

export function DriverImageUpload({
  onUploadComplete,
  onUploadError,
}: DriverImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <UploadButton<OurFileRouter>
      endpoint="driverImage"
      onClientUploadComplete={(res) => {
        if (res?.[0]?.url) {
          onUploadComplete?.(res[0].url);
          setIsLoading(false);
        }
      }}
      onUploadError={(error: Error) => {
        alert(`Upload failed: ${error.message}`);
        onUploadError?.(error);
        setIsLoading(false);
      }}
      onUploadBegin={() => {
        setIsLoading(true);
      }}
      appearance={{
        button: `
          w-full border-2 border-dashed border-[#f1c44f]/40 bg-[#071d3a] px-4 py-6 text-white 
          transition-colors hover:border-[#f1c44f]/60 hover:bg-[#071d3a]/80
          rounded-lg font-medium disabled:opacity-50
        `,
        container: "w-full",
        allowedContent: "hidden",
      }}
      content={{
        button: isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f1c44f]/30 border-t-[#f1c44f]" />
            Uploading...
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload size={20} className="text-[#f1c44f]" />
            <span className="text-sm">Click to upload a picture</span>
          </div>
        ),
      }}
    />
  );
}
