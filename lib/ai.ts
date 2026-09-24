type AIInput = {
  type: "caption" | "bio" | "ideas";
  trend: string;
  niche: string;
  language: string;
  profile: string;
};

export async function generateWithAI(input: AIInput) {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return fallback(input);
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.8,
          messages: [
            {
              role: "system",
              content: `You are TrendPulse AI.

Generate original creator content.

Never guarantee virality.

For political or current-affairs topics, keep wording factual and non-persuasive.

Language: ${input.language}.`,
            },
            {
              role: "user",
              content: `Type: ${input.type}

Trend: ${input.trend}

Niche: ${input.niche}

Profile DNA: ${input.profile}

Create polished Instagram-ready content.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return fallback(input);
    }

    const data = await response.json();

    return (
      data.choices?.[0]?.message?.content ||
      fallback(input)
    );
  } catch {
    return fallback(input);
  }
}

function fallback(input: AIInput) {
  if (input.type === "bio") {
    return `📍 Brasil 🇧🇷
✨ ${input.niche || "Vida real, histórias e momentos"}
🍯 Um pouco de mim todos os dias
👀 Vem me conhecer melhor nos stories`;
  }

  if (input.type === "ideas") {
    return `🎬 Reel: conte o contexto de "${input.trend}" em 3 cenas.

🪝 Hook: "Você também percebeu isso?"

💬 CTA: "Qual é a sua experiência? Conta nos comentários."`;
  }

  const angle = input.niche
    ? `Ângulo para ${input.niche}:`
    : "Ângulo para creators:";

  return `🚨 ${input.trend} 🚨

Esse assunto está chamando atenção agora. 👀

${angle}

Explique o contexto, dê sua perspectiva e termine com uma pergunta simples. ✨

E você, o que acha? 👇`;
}
