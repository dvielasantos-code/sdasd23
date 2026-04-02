"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Paperclip, Image, X } from "lucide-react";
import { geminiModel, SYSTEM_PROMPT } from "@/lib/gemini";
import { useData } from "@/context/DataContext";
import { ChatMessage } from "@/lib/types";

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Fala! Sou seu assistente financeiro. Me conta o que entrou ou saiu que eu registro tudo pra você. Pode falar, digitar, mandar áudio ou foto de comprovante!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { addTransaction } = useData();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractJSON = (text: string) => {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  };

  const cleanResponse = (text: string) => {
    return text.replace(/```json\s*[\s\S]*?\s*```/g, "").trim();
  };

  const processAIResponse = async (aiText: string) => {
    const json = extractJSON(aiText);
    const cleanText = cleanResponse(aiText);

    if (json && json.action === "register_transaction") {
      await addTransaction({
        type: json.type,
        amount: json.amount,
        category: json.category,
        description: json.description,
        date: json.date || new Date().toISOString().split("T")[0],
      });
      return cleanText || `Registrado! ${json.type === "income" ? "Entrada" : "Saída"} de R$ ${json.amount.toFixed(2)} em ${json.category}.`;
    }

    return cleanText || aiText;
  };

  const sendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: file ? `[${file.type.startsWith("audio") ? "Áudio" : "Imagem"} enviado] ${content}` : content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      const today = new Date().toISOString().split("T")[0];
      const systemWithDate = `${SYSTEM_PROMPT}\n\nData de hoje: ${today}`;

      let parts: any[] = [{ text: content || "Analise este arquivo e extraia informações financeiras." }];

      if (file) {
        const bytes = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(bytes).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        });
      }

      const chat = geminiModel.startChat({
        history: [
          { role: "user", parts: [{ text: systemWithDate }] },
          { role: "model", parts: [{ text: "Entendido! Estou pronto para ajudar com suas finanças." }] },
          ...chatHistory,
        ],
      });

      const result = await chat.sendMessage(parts);
      const aiText = result.response.text();
      const processedText = await processAIResponse(aiText);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: processedText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Ops, deu um erro aqui. Tenta de novo!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, attachedFile || undefined);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] sm:max-h-[600px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-income)] animate-pulse" />
          Assistente Financeiro
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-primary)] text-white rounded-br-md"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface-hover)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachedFile && (
        <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)] truncate">
            {attachedFile.type.startsWith("audio") ? "🔊" : "📸"} {attachedFile.name}
          </span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-[var(--color-border)] flex items-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*,image/*"
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          title="Enviar áudio ou foto"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-colors ${
            isListening
              ? "bg-[var(--color-expense)] text-white animate-pulse"
              : "hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          }`}
          title={isListening ? "Parar gravação" : "Falar"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Ouvindo..." : "Digite ou fale..."}
          className="flex-1 bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] rounded-xl px-4 py-2.5 text-sm outline-none border border-[var(--color-border)] focus:border-[var(--color-primary)] transition-colors"
          disabled={isListening}
        />

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !attachedFile)}
          className="p-2.5 rounded-xl bg-[var(--color-primary)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
