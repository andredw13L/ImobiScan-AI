import { useState } from "react";
import { toast } from "sonner";

export function useUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("http://localhost:3000/documentos/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast.success("Documentos enviados com sucesso!");
        setFiles([]);
      }
      else {
        throw new Error();
      }
      } catch {
        toast.error("Erro ao processar documentos.");
      } finally {
        setIsUploading(false);
      }
    };

  return { files, setFiles, isUploading, handleRemoveFile, handleUpload };
}
