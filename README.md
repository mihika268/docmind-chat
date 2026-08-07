# DocMind Chat

Act as a senior Full Stack AI Engineer.

Help me build a professional portfolio project named "DocMind AI".

Project Description:

DocMind AI is an intelligent web application that allows users to upload PDF documents and chat with them using AI. The application should extract text from uploaded PDFs, create embeddings, store them in a FAISS vector database, retrieve relevant content based on user questions, and generate intelligent answers using a local LLM.

Tech Stack:

- Python 3.11

- Flask

- LangChain

- FAISS

- Sentence Transformers

- PyMuPDF

- GPT4All or Ollama (prefer Ollama if possible)

- HTML5

- CSS3

- Vanilla JavaScript

Project Requirements:

Frontend:

- Modern dark UI

- Responsive design

- Landing page

- Drag-and-drop PDF upload

- Upload progress indicator

- ChatGPT-like chat interface

- Typing animation

- Loading spinner

- Clear chat button

- Display uploaded PDF name

- Attractive color palette

- Smooth animations

Backend:

- Flask REST API

- Modular project architecture

- Upload PDF endpoint

- PDF text extraction

- Text chunking

- Embedding generation

- FAISS vector database

- Conversational retrieval chain

- Chat endpoint

- Error handling

- Logging

- Environment variables

- Clean code

Project Structure:

DocMind-AI/

│

├── app.py

├── config.py

├── requirements.txt

├── README.md

├── .gitignore

│

├── uploads/

├── models/

├── vectorstore/

│

├── static/

│   ├── css/

│   ├── js/

│   └── images/

│

├── templates/

│   └── index.html

│

└── utils/

    ├── pdf_loader.py

    ├── embeddings.py

    ├── vectorstore.py

    ├── chatbot.py

    └── helpers.py

Features:

1. Upload PDF

2. Extract text

3. Chunk text

4. Generate embeddings

5. Store vectors in FAISS

6. Ask questions

7. Retrieve relevant chunks

8. Generate AI response

9. Maintain conversation history

10. Display answers in chat

Extra Features:

- Multiple PDF support

- Delete uploaded PDF

- Download chat history

- Dark mode

- Mobile responsive

- Source citations

- PDF preview

- Recent chat history

- Better error messages

- File size validation

Development Instructions:

- Build the project step by step.

- Do not generate the whole project at once.

- Wait for my confirmation after each step.

- Explain every file before writing code.

- Write clean, modular, production-quality code.

- Follow Python best practices.

- Use comments only where necessary.

- Keep the UI modern and professional.

- Make the project unique and suitable for a software engineering portfolio.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/997108c8-dd5a-48ef-8bd4-ff148e857c9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
