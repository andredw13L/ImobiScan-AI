import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpload } from "../../hooks/use-upload";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

export function DocumentUploadPage() {
  const { files, setFiles, isUploading, handleRemoveFile, handleUpload } =
    useUpload();

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      if (files.length >= 10) return "Limite de 10 arquivos atingido";

      const allowedExtensions = [
        "png",
        "jpg",
        "jpeg",
        "pdf",
        "webp",
        "docx",
        "txt",
        "tiff",
        "tif",
        "bmp",
      ];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return "Formato de arquivo não suportado pelo sistema";
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return "O arquivo deve ter menos de 10MB";
      }

      return null;
    },
    [files]
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error("Arquivo recusado", {
      description: `${file.name}: ${message}`,
    });
  }, []);

  return (
    <div className="w-full max-w-4xl  mx-auto p-4 cursor-pointer ">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onFileValidate={onFileValidate}
        onFileReject={onFileReject}
        accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.tiff,.tif,.bmp"
        maxFiles={10}
        multiple
      >
        <FileUploadDropzone className="border-border bg-card hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center rounded-full border bg-background p-3 shadow-sm">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">ImobiScan AI - Upload</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Arraste seus contratos aqui <br />
                (PDF, Imagens ou Word até 10MB)
              </p>
            </div>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4 shadow-sm">
              Selecionar Arquivos
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>

        <FileUploadList className="mt-6 gap-3">
          {files.map((file: File, index: number) => (
            <FileUploadItem
              key={`${file.name}-${index}`}
              value={file}
              className="bg-card border-border p-3 rounded-lg shadow-sm"
            >
              <div className="flex w-full items-center gap-3">
                <FileUploadItemPreview className="size-10 rounded object-cover shadow-sm shrink-0" />

                <div className="flex-1 min-w-0">
                  <FileUploadItemMetadata />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </FileUploadItem>
          ))}
        </FileUploadList>

        {files.length > 0 && (
          <Button
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading
              ? "Enviando para Análise..."
              : `Analisar ${files.length} Documentos`}
          </Button>
        )}
      </FileUpload>
    </div>
  );
}
