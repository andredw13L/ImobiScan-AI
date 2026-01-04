from fastapi import FastAPI, UploadFile, File, HTTPException
from services.ocr_service import OCRService
from services.rag_service import ServicoRAG
from services.db_repository import DbRepository
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Imobiscan AI", description="Motor de OCR e RAG Local")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ocr_service = OCRService()
servico_rag = ServicoRAG()
db = DbRepository()

@app.post("/extrair-texto")
async def extrair_texto(file: UploadFile = File(...)):
    try:
        content = await file.read()
        texto, metadados, status = await ocr_service.processar_arquivo(file.filename, content)

        return {
            "texto": texto,
            "metadados": metadados,
            "tipo": file.filename.split('.')[-1],
            "status": status
        }

    except Exception as e:
        print(f"Erro: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no processamento.")

@app.post("/perguntar")
async def post_pergunta(id_documento: str, pergunta: str):
    
    texto_documento = db.buscar_texto_por_id(id_documento)
    
    if not texto_documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    
    resposta = servico_rag.responder_pergunta(texto_documento, pergunta)
    
    return {"resposta": resposta}
