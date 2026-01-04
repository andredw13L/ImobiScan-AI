import os
from fastapi import HTTPException 
from langchain_ollama import ChatOllama
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter

class ServicoRAG:
    def __init__(self):
        
        self.modelo_busca = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
       
        
        self.ia = ChatOllama(
            model="qwen2.5:1.5b", 
            base_url="http://ollama-service:11434",
            temperature=0
        )

        template = """Você é um assistente restrito.
         Responda APENAS com base no contexto fornecido. 
         Se a resposta não estiver lá, diga que não sabe. 
         Não tente inventar explicações técnicas fora do documento.

Contexto:
{context}

Pergunta:
{question}

Resposta Profissional em Português:"""
        
        self.prompt = PromptTemplate.from_template(template)

    def responder_pergunta(self, texto_documento: str, pergunta_usuario: str):
        try:
            
            text_splitter = RecursiveCharacterTextSplitter(
                # tamanho do trecho (ajuste conforme necessário)
                chunk_size=500,
                chunk_overlap=50 
            )
            documentos_divididos = text_splitter.split_text(texto_documento)

            
            vectorstore = FAISS.from_texts(documentos_divididos, self.modelo_busca)
            
            # Ajuste o valor de 'k' conforme necessário para retornar mais contextos.
            retriever = vectorstore.as_retriever(search_kwargs={"k": 1})

            
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | self.prompt
                | self.ia
                | StrOutputParser()
            )

            return chain.invoke(pergunta_usuario)

        except Exception as e:
            print(f"Erro detalhado: {e}")
            raise HTTPException(
                status_code=503,
                detail="A IA demorou a responder. Tente novamente em instantes."
            )
