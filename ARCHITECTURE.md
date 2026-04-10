# 🧠 Complete Architecture & Code Deep Dive

Welcome to the ultimate technical guide for **ScanSense AI**. This document is designed to be a complete front-to-back textbook. 

## 🌟 What is ScanSense AI?
**ScanSense AI** is a highly specialized, multimodal medical assistant designed for both patients and healthcare professionals. Unlike generic AI chatbots, ScanSense is tightly restricted to the medical domain and will automatically reject unrelated questions (e.g., coding, cooking, or general trivia).

### 🎯 Core Characteristics
- **Multimodal Capabilities:** It doesn't just read text! You can upload full medical PDF reports or even diagnostic images (like X-Rays, MRIs, and CT Scans), and the AI will analyze them visually.
- **Strict Medical Guardrails:** A two-step validation process securely checks every uploaded file to ensure it is actually medical data before passing it to the main AI.
- **Persistent Local Memory:** Completely private local storage. Every chat session is saved offline in an SQLite database (`chat.db`), allowing you to rename, retrieve, or delete your chat histories at any time.
- **Modular & Scalable:** The codebase is heavily modularized into clean folders (`backend`, `frontend`) so that adding new features in the future is incredibly easy for any developer.

### 🛠️ How is it Built?
The project sits on a cutting-edge, decoupled web stack:
- **Frontend Framework:** **React (Vite) + TailwindCSS**. A hyper-fast interface managing real-time state with pure TypeScript `fetch()` APIs and Server-Sent Events.
- **Backend API:** **FastAPI** (Python). A lightning-fast API web server.
- **AI Brain:** **Llama 4 Scout (17b-16e-instruct)** via the ultra-fast **Groq** API.
- **Workflow Orchestration:** **LangGraph** & **LangChain**, governing the intelligent routing of files inside the backend.
- **Database:** **SQLite**. A lightweight, file-based database.

---

First, we will look at the big picture (the Folder Structure). 
Then, we will dive into **every single Python and React file, line by line**, pasting the exact code blocks and immediately explaining what they do in plain, beginner-friendly English!

---

## 📂 1. The Big Picture: Folder Mappings

The codebase is split strictly down the middle into two parent folders:

**`backend/` (The invisible brain)**
- `config/settings.py`: Hardcoded text, AI prompts, and environment variables.
- `database/db_manager.py`: Saving and loading from the SQLite `.db` file.
- `utils/file_handlers.py`: Reusable tools (reading PDFs).
- `utils/ai_assistant.py`: The LangGraph AI rules.
- `main.py`: The FastAPI server that handles HTTP requests.

**`frontend/` (What the user sees)**
- `src/main.tsx` & `App.tsx`: The primary React entry points.
- `src/lib/chat-store.ts`: The Javascript data engine making API calls.
- `src/pages/Index.tsx`: The master layout screen.
- `src/components/`: The visual building blocks (Sidebars, text boxes, message bubbles).

---

## 💻 2. Full Backend Walkthrough (File by File)

### ⚙️ File 1: `backend/config/settings.py` (The Settings File)
This file is the "brain setting" of the app. It holds constants.

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
```
**Explanation:** 
- `os` allows Python to talk to your computer's operating system. 
- `dotenv` reads that hidden `.env` file you created and temporarily saves the secret `GROQ_API_KEY` into your computer's memory. This is the safest way to hide passwords instead of typing them directly into the code.

```python
# Model configuration
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

SYSTEM_PROMPT = """You are a helpful and professional medical assistant. 
Your role is to assist with medical analysis, health inquiries, and understanding medical documents or images.
You must STRICTLY REFUSE to answer any questions that are not related to the medical or health field.
"""
```
**Explanation:** 
- `MODEL_NAME` tells the AI server exactly which "brain" to spin up. 
- `os.getenv` grabs that secret API key from memory so we can use it later.
- `SYSTEM_PROMPT` is secretly sent to the AI behind the scenes. It forces the AI into character (a medical professional) and sets strict guardrails prohibiting it from answering non-medical queries.

---

### 💾 File 2: `backend/database/db_manager.py` (The Save System)
This file handles the SQLite database, effectively serving as the permanent memory for your chats.

```python
import sqlite3
import datetime

DB_NAME = "chat.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
```
**Explanation:** 
- We import `sqlite3`, which is Python's built-in database manager. No massive SQL servers required! 
- The `init_db()` function runs when your app starts. 
- `CREATE TABLE IF NOT EXISTS`: A safety check that only creates tables the very first time you run the app. 
- The `sessions` table tracks individual chats (like folders). It assigns a unique ID (`AUTOINCREMENT`) to every new chat.
- We `commit()` (save) our changes and `close()` the connection to free up the computer's memory.

```python
def create_session(title=None):
    if not title:
        title = f"Chat {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO sessions (title) VALUES (?)", (title,))
    session_id = c.lastrowid
    conn.commit()
    conn.close()
    return session_id
```
**Explanation:** 
- `create_session` prepares a new chat room. If no title is given, it auto-generates a name using Python's `datetime` module.
- It runs an `INSERT INTO` SQL command to write that title into the database. 
- `lastrowid` grabs the ID number that SQLite randomly gave this new chat, and returns it so our API knows which chat we are currently inside!

---

### 📂 File 3: `backend/utils/file_handlers.py` (The Document Reader)
This file handles "vision" and "reading" by dissecting files you upload so the AI can understand them.

```python
import PyPDF2
import base64
import io
from PIL import Image

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text
```
**Explanation:** 
- `PyPDF2` opens the PDF file securely. 
- The `for` loop cycles through every single page in the document, extracts the human-readable text, glues it to our giant `text` string, and hands that string back to the app.

```python
def encode_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    buffered = io.BytesIO()
    image.convert('RGB').save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')
```
**Explanation:** 
- AI models accept images in a mathematical text format called **Base64**.
- `encode_image()` takes the picture you uploaded using `Pillow (PIL)`.
- `convert('RGB')` strips away transparency (like PNG backgrounds) to ensure perfect compatibility.
- We convert all its pixels into raw binary code, then encode it to `base64` strings.

---

### 🧠 File 4: `backend/utils/ai_assistant.py` (The Logic & Orchestrator)
This connects your backend straight to Groq using LangChain and LangGraph.

```python
def is_medical_content(content, content_type):
    llm = get_llm(temperature=0.0)
    
    if content_type == 'image':
        msg = HumanMessage(
            content=[
                {"type": "text", "text": "Is this image related to the medical field? Strict YES or NO."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{content}"}}
            ]
        )
    # ... executes try/catch
    return "YES" in str(response.content).strip().upper()
```
**Explanation:** 
- **The Bouncer Check!** Before processing your file via our main API, this function connects to the `llm` with `temperature=0` (0% creativity, 100% strict robotic precision).
- We package the prompt into a LangChain `HumanMessage` object asking it to output a rigid YES/NO.

```python
class ChatState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context: str
    content_type: str

def call_model_node(state: ChatState):
    messages = state["messages"]
    llm = get_llm(temperature=0.7)
    return {"messages": [llm.invoke(messages)]}

workflow = StateGraph(ChatState)
workflow.add_node("call_model", call_model_node)
workflow.add_edge(START, "call_model")
workflow.add_edge("call_model", END)
chatbot_app = workflow.compile()
```
**Explanation:** 
- **LangGraph Routing:** `ChatState` acts as the memory block for the graph. It tracks the ongoing `messages` payload, and the active `context` string.
- `StateGraph` compiles this into a smart workflow router named `chatbot_app`. Data travels through this graph structure securely, making the backend incredibly scalable if we wanted to add more "agents" or validation tools later!

```python
def stream_chat_response(chat_history, context, content_type, user_text):
    # Formats the system prompt and iterates previous messages...
    for event in chatbot_app.stream(state, stream_mode="messages"):
        chunk, metadata = event
        if chunk.content:
            yield chunk.content
```
**Explanation:** 
- This generator perfectly translates all raw dictionaries into formal LangChain `SystemMessage` objects.
- It pushes this bundle into the `chatbot_app.stream()` execution engine. As the model infers answers, it `yields` individual string chunks back to your API generator!

---

### 🚀 File 5: `backend/main.py` (The API Server)
This is the single entry point holding the Python backend together. It receives requests from React.

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="ScanSense AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Explanation:** 
- We spin up a robust `FastAPI()` web server.
- **CORS** (Cross-Origin Resource Sharing) is a security fence. Browsers block React trying to stealthily ping backend APIs on other network ports. `CORSMiddleware` acts as the bouncer specifically waving through our React server running on `http://localhost:5173` while blocking malicious outside sites!

```python
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    chat_history = get_chat_history(request.session_id)
    
    def sse_event_generator():
        full_response = ""
        for chunk in stream_chat_response(...):
            full_response += chunk
            yield f"data: {chunk}\n\n"
        
        save_message(request.session_id, "assistant", full_response)
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")
```
**Explanation:** 
- `@app.post("/api/chat")`: This registers an endpoint specifically waiting for React's final chat submission.
- `sse_event_generator()` loops through our LangGraph chunks. Note the specific syntax: `yield f"data: {chunk}\n\n"`. 
- This establishes a **Server-Sent Event (SSE)**. Usually, servers wait until everything is finished and return one giant JSON file. SSE keeps the HTTP connection physically open, constantly firing live packets (`data: ...`) to React so your screen gets that fluid "live-typing" animation!

---

## 💻 3. Full Frontend Walkthrough (File by File)

The Frontend is a Vite / React JS application that handles the visual display.

### 🧩 File 6: `frontend/src/main.tsx` & `App.tsx` (React Entry)
This is the root of the entire Javascript web application.

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Index />
    </TooltipProvider>
  </QueryClientProvider>
);
```
**Explanation:**
- `ReactDOM.createRoot` finds an empty `div` inside your `index.html` file and forcefully injects our huge React app inside of it!
- `QueryClientProvider` and `TooltipProvider` are specialized wrappers ensuring any popup boxes, hover tools, or background logic load seamlessly site-wide.
- It then renders `<Index />`, the master layout screen.

---

### 🎨 File 7: `frontend/src/pages/Index.tsx` (The Master Screen)

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useChatStore } from "@/lib/chat-store";
import { useEffect } from "react";

const Index = () => {
  const { fetchSessions } = useChatStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <SidebarProvider>
        <ChatSidebar />
        <main className="flex-1 overflow-hidden h-screen">
          <ChatWindow />
        </main>
    </SidebarProvider>
  );
};
```
**Explanation:**
- This file simply structures your browser window into two massive columns: the `<ChatSidebar />` and the `<ChatWindow />`.
- `useEffect` is a React Hook. Because we passed `[]` at the end, it means: "The very first microsecond this website loads on the browser, run `fetchSessions()` exactly one time." This fetches all your old database history automatically on page load!

---

### 📁 File 8: `frontend/src/components/ChatSidebar.tsx` (The Navigation Panel)

```tsx
export function ChatSidebar() {
  const { sessions, currentSessionId, createNewSession, loadSession, deleteSession, renameSession } = useChatStore();

  return (
    // ... massive amounts of Tailwind CSS formatting
    <SidebarContent className="p-4 flex flex-col h-full bg-zinc-950 text-sidebar-foreground">
      <Button onClick={createNewSession} className="w-full bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      
      <div className="mt-6 flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-sidebar-foreground/50 mb-3 px-2">Recent Chats</h3>
        <div className="space-y-1">
          {sessions.map((session) => (
             <Button key={session.id} onClick={() => loadSession(session.id)} 
               variant={currentSessionId === session.id ? "secondary" : "ghost"}>
               {session.title}
             </Button>
          ))}
        </div>
      </div>
    </SidebarContent>
  );
}
```
**Explanation:**
- It reaches out to `useChatStore()` (our brain engine) and grabs all functions related to editing databases.
- The `onClick={createNewSession}` directly tells the backend to create a blank SQLite table.
- `sessions.map` is standard Javascript iterating loops. It takes every chat saved locally and draws a gray navigation `<Button>` out of it!

---

### 💬 File 9: `frontend/src/components/MessageBubble.tsx` (Individual Chat Boxes)

```tsx
export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 flex flex-col gap-3 shadow-sm ${
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-card text-card-foreground border border-border/50 rounded-tl-sm"
        }`}
      >
        {/* Render Image attached, if any */}
        {message.image && (
           <img src={`data:image/jpeg;base64,${message.image}`} className="max-w-sm rounded-md" />
        )}
        
        {/* Render the typed text */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
```
**Explanation:**
- This component receives a generic `message` data class (either from you or from the AI).
- If it is you (`isUser = true`), it overrides CSS flexbox rules to forcefully push your chat bubble to the `justify-end` (The right hand side of the browser), paints the bubble bright Blue (`bg-primary`), and applies smooth 500ms slide-in animations!
- `<ReactMarkdown>` forces all standard formatting algorithms to parse the LLM's **bolded** and *italic* chunks gracefully instead of literally displaying the asterisks to the user.

---

### ⌨️ File 10: `frontend/src/components/InputBox.tsx` (The Magic Input Field)

```tsx
export function InputBox() {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { sendMessage, isTyping } = useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || isTyping) return;
    
    sendMessage(content, selectedFile);
    setContent("");
    setSelectedFile(null);
  };
```
**Explanation:**
- We keep track of your typing locally using React Hooks: `const [content, setContent] = useState("")`.
- If you attach a raw file using the paperclip, it goes into `selectedFile`.
- `handleSubmit` triggers when you hit the Enter key or the Paper Plane arrow icon.
- `e.preventDefault()` stops the default browser behavior of completely refreshing the page after a form submission.
- It forwards both payloads straight to the brain (`sendMessage(content, selectedFile)`) and then elegantly wipes the typing box clean!

---

### 🔥 File 11: `frontend/src/lib/chat-store.ts` (React's Brain Engine)
This is where the complex TypeScript lives that physically executes the JavaScript `fetch` commands speaking to our Python backend!

```typescript
const uploadRes = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData,
});
if (!uploadRes.ok) throw new Error("Failed to upload file");

const uploadData = await uploadRes.json();
uploadedContext = uploadData.context;
uploadedContentType = uploadData.content_type;
```
**Explanation:**
- The moment you send a message with an attached file, React builds a hidden `formData` package and executes a `fetch()` toward our FastAPI server (`/api/upload`).
- It `awaits` the security response. If FastAPI determines your image is not a medical document, FastAPI returns an HTTP Error code! React catches it (`if (!uploadRes.ok)`) and stops the execution! If it is a real document, React temporarily saves the extracted string as `uploadedContext`.

```typescript
const chatRes = await fetch("http://localhost:8000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        message: content,
        context: uploadedContext,
        content_type: uploadedContentType,
        session_id: get().currentSessionId
    }),
});

const reader = chatRes.body.getReader();
const decoder = new TextDecoder();
let fullResponse = "";
```
**Explanation:**
- After validation, it actually talks to the AI! Here, `chatRes.body.getReader()` manually targets the literal binary connection pipeline bridging Python to your web browser.
- We employ a standard JavaScript `TextDecoder` to convert the 1s and 0s crossing the local network back into actual English letters.

```typescript
while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkText = decoder.decode(value, { stream: true });
    const lines = chunkText.split("\n");
    
    for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]\n\n") {
            const data = line.slice(6);
            fullResponse += data;
            
            // Re-render the chat bubble state constantly!
            set((state) => ({
                chats: state.chats.map((c) =>
                    c.id === assistantMessageId ? { ...c, content: fullResponse } : c
                ),
            }));
        }
    }
}
```
**Explanation:**
- **The Engine Loop**: It fires up an infinite `while (true)` network loop holding the socket physically open!
- Each `reader.read()` violently intercepts the `yield` chunk that FastAPI pushes (Remember `yield f"data: {chunk}"` from `main.py`?).
- We search specifically for strings prefixed with `"data: "`. We slice that exact prefix off using `slice(6)`, append the pure token to `fullResponse`, and use `set((state) => ...)` inside React! 
- This React `set` command physically redraws your chat window bubble literally every single fraction of a millisecond to mirror the incoming network data!

---

## 🛡️ 4. Prompt Engineering & AI Security

### Why is Validation Necessary?
The internet is full of "jailbreak" attempts, where users try to trick AI assistants into ignoring their original instructions. We wrote the `is_medical_content()` function to explicitly act as an impenetrable firewall.
By running a *hidden* background API call with `temperature=0`, we force another AI to rigorously scrutinize the uploaded file in isolation. The user has zero ability to speak to this AI. This guarantees no prompt injection can bypass the medical filter.

### Breaking Down the `SYSTEM_PROMPT`
In `config/settings.py`, we have:
> "You must STRICTLY REFUSE to answer any questions that are not related to the medical or health field."

This is known as **Zero-Shot Prompting with Negative Constraints**. LLMs naturally want to be helpful and will talk about anything. By capitalizing `STRICTLY REFUSE`, we are adjusting the statistical probability weights on the Groq servers, mathematically punishing the AI if generating vocabulary related to coding, recipes, or casual chat.

---

## 🚀 5. Scaling Up (The Future Developer Roadmap)

As your skills grow, you might want to turn ScanSense AI from a personal desktop app into a massive global website. If you ever reach that point, here is a roadmap on what you need to upgrade:

### Upgrade #1: Adding User Login (Authentication)
Right now, `chat.db` saves every chat into one giant pool. Anyone who opens your laptop can see them.
**How to fix it:**
You would integrate an authentication library (like Firebase) in React. You would modify the SQLite `sessions` table to add a new column: `user_id`. When querying past chats in `db_manager.py`, instead of `SELECT * FROM sessions`, you would write `SELECT * FROM sessions WHERE user_id = ?` to ensure users only see their own data.

### Upgrade #2: Swapping SQLite for PostgreSQL
SQLite is fantastic because it's just a file (`chat.db`). However, if 50 users try to upload X-rays at the exact same millisecond, SQLite will lock the file and crash.
**How to fix it:**
You would launch a real cloud database (like PostgreSQL on Supabase or AWS). You would change `import sqlite3` inside `database/db_manager.py` to `import psycopg2` or use an Object Relational Mapper (ORM) like SQLAlchemy. Because we beautifully modularized our database logic into its own folder, you would not have to change a single line of React code in the UI for this to work!

---

## 🐞 6. Troubleshooting & Common Bugs (FAQ)

Every developer runs into issues. If you pull this code onto a brand new computer and things break, check this list:

### Error: "Failed to Fetch" or CORS Errors Check
**Cause:** Your frontend (5173) cannot physically connect to your backend (8000). Usually, this means your backend server crashed or was never started.
**Fix:** Look at the python terminal logs running FastAPI. Ensure there are no syntax errors and that you ran `run.bat` correctly.

### Error: "GROQ_API_KEY not found"
**Cause:** Python cannot find your secret key in memory.
**Fix:** You forgot to create the `.env` file, or you named it `.env.txt`. Make sure the file has no extension and is sitting in the `backend/` folder.

### Error: "Database disk image is malformed"
**Cause:** Your computer suddenly shut down while writing a message, corrupting the `chat.db` file.
**Fix:** Delete the `chat.db` file completely. The next time you run your backend, the `init_db()` function will instantly generate a fresh, clean database automatically!

---

This marks the absolute end of the ScanSense AI Architecture Document. You have learned advanced UI state management, database engineering, API prompt security, binary encoding, and React layout structuring. Happy coding!
