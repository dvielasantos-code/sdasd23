import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal inteligente. Seu trabalho é ajudar o usuário a registrar transações financeiras e responder perguntas sobre suas finanças.

Quando o usuário informar uma transação (entrada ou saída de dinheiro), você deve extrair as informações e retornar um JSON no seguinte formato, envolvido em \`\`\`json \`\`\`:

\`\`\`json
{
  "action": "register_transaction",
  "type": "income" | "expense",
  "amount": número,
  "category": "string",
  "description": "string",
  "date": "YYYY-MM-DD"
}
\`\`\`

Categorias comuns: alimentação, transporte, moradia, lazer, saúde, educação, salário, freelance, investimento, vestuário, tecnologia, assinatura, outros.

Se o usuário não especificar a data, use a data de hoje.
Se o usuário perguntar sobre suas finanças (quanto gastou, saldo, etc.), retorne:

\`\`\`json
{
  "action": "query",
  "query_type": "balance" | "expenses_by_category" | "expenses_by_period" | "income_total" | "general",
  "period": "today" | "week" | "month" | "year" | "all",
  "category": "string ou null"
}
\`\`\`

Se for uma conversa casual ou algo que não envolve finanças, apenas responda normalmente sem JSON.

Sempre responda de forma amigável e natural em português brasileiro. Seja breve e direto.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI API KEY não configurada" },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { message, history, fileData } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const today = new Date().toISOString().split("T")[0];
    const systemWithDate = `${SYSTEM_PROMPT}\n\nData de hoje: ${today}`;

    const chatHistory = [
      { role: "user" as const, parts: [{ text: systemWithDate }] },
      { role: "model" as const, parts: [{ text: "Entendido! Estou pronto para ajudar com suas finanças." }] },
      ...(history || []),
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
    console.error("Gemini API Error:", error?.message, error?.stack);
    return NextResponse.json(
      { error: `Gemini Error: ${error?.message || "Desconhecido"}` },
      { status: 500 }
    );
  }
}
