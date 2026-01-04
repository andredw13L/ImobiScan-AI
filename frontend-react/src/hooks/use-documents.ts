import { useState, useEffect } from "react";


export interface Documento {
  id: string;
  nomeOriginal: string;
  nomeArquivo: string; 
  tipo: string;
  path: string;
  status: "pendente" | "concluído";
  createdAt: string;
  textoExtraido: string | null;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3000/documentos");
      
      if (!response.ok) return;

      const data = await response.json();
      const listaFinal = Array.isArray(data) 
        ? data 
        : (data?.arquivo && Array.isArray(data.arquivo)) 
          ? data.arquivo 
          : [];

      setDocuments(listaFinal);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 500);
    return () => clearInterval(interval);
  }, []);

  return { documents, isLoading, refresh: fetchDocuments };
}