import { useState } from "react";
import "./App.css";
import { Toaster } from "sonner";
import { DocumentUploadPage } from "./pages/Upload/UploadPage";
import { AnalisePage } from "./pages/Analise/AnalisePage"; 
import { ThemeProvider } from "@/components/theme-provider";
import { Building2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { Documento } from "./hooks/use-documents";

function App() {
  const [activePage, setActivePage] = useState<"upload" | "analise">("upload");
  
  
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);

  
  const handleSelectDocument = (doc: Documento) => {
    setSelectedDoc(doc);
    setActivePage("analise");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300 flex w-full">
          
          <AppSidebar onSelectDoc={handleSelectDocument} />

          <main className="flex-1 flex flex-col items-center pt-20 p-4 relative">
            <div className="w-full max-w-7xl flex flex-col items-center">
              
              
              <header className="mb-10 space-y-1 text-center flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Building2 className="size-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    ImobiScan AI
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  {activePage === "upload" 
                    ? "Analise e gerencie seus contratos imobiliários com inteligência."
                    : `Analisando: ${selectedDoc?.nomeOriginal}`}
                </p>
              </header>

              
              {activePage === "upload" ? (
                <DocumentUploadPage />
              ) : (
                selectedDoc && <AnalisePage document={selectedDoc} onBack={() => setActivePage("upload")} />
              )}
            </div>
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton duration={5000}/>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
