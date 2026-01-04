import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useDocuments, type Documento } from "../hooks/use-documents";


interface AppSidebarProps {
  onSelectDoc: (doc: Documento) => void;
}


export function AppSidebar({ onSelectDoc }: AppSidebarProps) {
  const { documents, isLoading } = useDocuments();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border/50"
    >
      <SidebarHeader className="h-12 flex items-end justify-center px-2">
        <SidebarTrigger className="hover:bg-accent" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
            Documentos Recentes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : documents?.length === 0 ? (
                <p className="px-4 py-2 text-xs text-muted-foreground italic group-data-[collapsible=icon]:hidden">
                  Nenhum documento encontrado.
                </p>
              ) : (
                documents?.map((doc: Documento) => (
                  <SidebarMenuItem key={doc.id}>
                    <SidebarMenuButton
                      className="py-6 px-4 cursor-pointer transition-colors duration-200 hover:bg-accent/80 active:bg-accent"
                      tooltip={doc.nomeOriginal}
                      onClick={() => onSelectDoc(doc)}
                    >
                      {doc.status === "pendente" ? (
                        <Loader2 className="size-4 animate-spin text-blue-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      )}

                      <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-medium text-sm">
                          {doc.nomeOriginal}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {doc.status}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
