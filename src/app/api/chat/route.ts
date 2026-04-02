import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/gemini";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, fileData } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const today = new Date().toISOString().split("T")[0];
    const systemWithDate = `${SYSTEM_PROMPT}\n\nData de hoje: ${today}`;

    const chatHistory = [
      { role: "user" as const, parts: [{ text: systemWithDate }] },
      { role: "model" as const, parts: [{ text: "Entendido! Estou pronto para ajudar com suas finanças." }] },
      ...history,
    ];

    const chat = model.startChat({ history: chatHistory });

    let parts: any[] = [{ text: message || "Analise este arquivo e extraia informações financeiras." }];

    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data,
        },
      });
    }

    const result = await chat.sendMessage(parts);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
