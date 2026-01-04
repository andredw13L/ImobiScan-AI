class ServicoRAG:
    def __init__(self):
        self.modelo_busca = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.ia = ChatOllama(
            model="qwen2.5:1.5b", 
            base_url="http://ollama-service:11434",
            temperature=0
        )

        template = """Você é um assistente de análise de documentos.
Sua tarefa é extrair informações do contexto fornecido de forma objetiva.

REGRAS CRÍTICAS:
1. Responda APENAS com base nos trechos do documento abaixo.
2. Se a pergunta for sobre algo que NÃO está no texto, responda exatamente: "Informação não localizada no documento original."
3. Não use conhecimento externo ou fatos que não aparecem no contexto.
4. Mantenha a resposta concisa e técnica.

Contexto do Documento:
{context}

Pergunta do Usuário:
{question}

Resposta Técnica:"""
        
        self.prompt = PromptTemplate.from_template(template)

    def responder_pergunta(self, texto_documento: str, pergunta_usuario: str):
        try:
            # tamanho do trecho (ajuste conforme necessário)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=600,
                chunk_overlap=120 
            )
            documentos_divididos = text_splitter.split_text(texto_documento)

            vectorstore = FAISS.from_texts(documentos_divididos, self.modelo_busca)
            
            # Ajuste o valor de 'k' conforme necessário para retornar mais contextos.

            def formatDocs(docs):
                return "\n\n".join(f"[Trecho]: {doc.page_content}" for doc in docs)

            chain = (
                {
                    "context": retriever | RunnableLambda(formatDocs),
                    "question": RunnablePassthrough(),
                }
                | self.prompt
                | self.ia
                | StrOutputParser()
            )

            return chain.invoke(pergunta_usuario)

        except Exception as e:
            print(f"Erro no RAG: {e}")
            raise HTTPException(status_code=503, detail="O assistente está processando, tente novamente.")