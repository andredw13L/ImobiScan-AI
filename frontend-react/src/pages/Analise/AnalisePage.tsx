import { Button } from "@/components/ui/button";
import type { Documento } from "@/hooks/use-documents";
import { ArrowLeft, Send, Loader2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalisePageProps {
  document: Documento;
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function MessageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="bg-muted rounded-2xl rounded-tl-none border px-4 py-3 w-[70%]">
        <div className="space-y-2">
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-3 bg-slate-300 rounded w-full"
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-3 bg-slate-300 rounded w-[80%]"
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="h-3 bg-slate-300 rounded w-[40%]"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({ role, content }: Message) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
          role === "user"
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted rounded-tl-none border"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}

export function AnalisePage({ document, onBack }: AnalisePageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou o Qwen. Como posso te ajudar com o documento: "${document.nomeOriginal}"?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      scrollEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    };
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: currentInput }]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `http://localhost:3000/documentos/${document.id}/perguntar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta: currentInput }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro na análise");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.arquivo?.resposta ||
            data.resposta ||
            "Resposta não encontrada.",
        },
      ]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Ops: ${errorMessage}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const fileUrl = document?.path?.startsWith("uploads")
    ? `http://localhost:3000/${document.path}`
    : `http://localhost:3000/uploads/${document.path}`;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 p-4">
      <div className="flex justify-start w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Voltar ao Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        
        <div className="space-y-6">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-3 border-b bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documento Original
            </div>
            <div className="aspect-[1/1.4] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
              {document?.path ? (
                document.tipo.includes("pdf") ? (
                  <iframe
                    src={`${fileUrl}#toolbar=0`}
                    className="w-full h-full border-none"
                    title="PDF"
                  />
                ) : (
                  <img
                    src={fileUrl}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Arquivo não encontrado.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-3 border-b bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Texto Extraído (OCR)
            </div>
            <ScrollArea className="h-50 p-4 text-sm whitespace-pre-wrap">
              {document.textoExtraido || "Extraindo texto..."}
            </ScrollArea>
          </div>
        </div>

        
        <div className="rounded-xl border bg-card shadow-lg flex flex-col h-150 lg:h-187.5 overflow-hidden relative">
          
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Assistente de Documentos
                </span>
                <span className="text-sm font-bold text-primary">
                  ImobiScanAI Qwen 2.5
                </span>
              </div>
            </div>
          </div>

          
          <div className="flex-1 overflow-hidden relative bg-background/50">
            <ScrollArea className="h-full w-full">
              <div className="p-4 min-h-full flex flex-col justify-end">
                <AnimatePresence mode="popLayout" initial={false}>
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      role={msg.role}
                      content={msg.content}
                    />
                  ))}
                  {isTyping && <MessageSkeleton />}
                </AnimatePresence>
                
                <div ref={scrollEndRef} className="h-12 w-full" />
              </div>
            </ScrollArea>
          </div>

         
          <div className="p-4 border-t bg-card shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={document.status !== "concluído"}
                placeholder="Pergunte sobre o documento..."
                className="w-full bg-muted border rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={
                  isTyping || !input.trim() || document.status !== "concluído"
                }
                className="absolute right-1.5 rounded-full size-9 p-0 cursor-pointer"
              >
                {isTyping ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
