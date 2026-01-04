# ImobiScan AI

Este projeto é um MVP de um sistema de Gestão de Documentos com Inteligência Artificial (OCR e RAG). Ele permite o upload de arquivos, processamento de texto em segundo plano e um chat inteligente para tirar dúvidas sobre os documentos enviados.

## Decisões Técnicas e Stack

* **Frontend (React):** Interface reativa e intuitiva para o gerenciamento de documentos e interação com o chat.
* **Backend (NestJS & MySQL):** Arquitetura modular e escalável. O **MySQL** foi escolhido pela sua confiabilidade no armazenamento de metadados.
* **Processamento de Imagem (PyTesseract):** Integração de OCR (Optical Character Recognition) para garantir a leitura de documentos em formato de imagem ou PDFs digitalizados.
* **LLM (Qwen):** Utilização do modelo **Qwen** para o processamento de linguagem natural, garantindo alta precisão na compreensão de documentos e geração de respostas.
* **BullMQ & Redis:** Gerenciamento de filas assíncronas para o processamento de OCR e extração de texto, mantendo a API sempre responsiva.
* **Embeddings (MiniLM):** Modelo leve e eficiente para busca semântica, permitindo encontrar informações por contexto com baixo consumo de recursos no Docker.



---

## Como Configurar e Executar

### Pré-requisitos
* **Docker** e **Docker Compose** instalados.

### Passo a Passo

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/andredw13L/ImobiScan-AI.git
    cd ImobiScan-AI
    ```

2.  **Executar o Projeto:**
    Na raiz do projeto, execute o comando:
    ```bash
    docker-compose up
    ```

3.  **Acessar a Aplicação:** `http://localhost:4200`
