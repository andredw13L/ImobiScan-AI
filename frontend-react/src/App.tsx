import "./App.css";
import { Toaster } from "sonner";
import { DocumentUploadPage } from "./pages/Upload/UploadPage";
import { ThemeProvider } from "@/components/theme-provider";
import { Building2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300 flex w-full">
          <AppSidebar />

          <main className="flex-1 flex flex-col items-center pt-20 p-4 relative">
            <div className="w-full max-w-4xl flex flex-col items-center">
              <header className="mb-10 space-y-1 text-center flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Building2 className="size-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    ImobiAI
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Analise e gerencie seus contratos imobiliários com
                  inteligência.
                </p>
              </header>

              <DocumentUploadPage />
            </div>
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
