import { NextResponse } from "next/server";

type RequestBody = {
  type: "caption" | "bio" | "reel";
  trend: string;
  niche?: string;
  language?: string;
  profile?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const {
      type,
      trend,
      niche = "creator",
      language = "English",
      profile = "",
    } = body;

    if (!trend) {
      return NextResponse.json(
        {
          success: false,
          error: "Trend is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        content: fallback({
          type,
          trend,
          niche,
          language,
        }),
        mode: "fallback",
      });
    }

    const prompt = `
You are an advanced social media trend content engine.

Create original Instagram-ready content.

Trend:
${trend}

Creator niche:
${niche}

Language:
${language}

Profile DNA:
${profile || "Not provided"}

Content type:
${type}

Requirements:

- Do not copy existing posts.
- Do not guarantee virality.
- Make the content natural and human.
- Use the current trend as the topic/angle.
- Keep the creator's niche central.
- Use appropriate emojis.
- Make it engaging but not spammy.
- Include a natural CTA where appropriate.
- If the topic is political/current affairs, remain factual and non-persuasive.

For a caption:
Create a strong hook, body, CTA and relevant hashtags.

For a bio:
Create a concise Instagram bio matching the creator niche.

For a reel:
Create:
1. Hook
2. 3-scene Reel concept
3. On-screen text
4. CTA
5. Caption idea
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.85,
          messages: [
            {
              role: "system",
              content:
                "You are a professional social media strategist and content creator.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        content: fallback({
          type,
          trend,
          niche,
          language,
        }),
        mode: "fallback",
      });
    }

    const data = await response.json();

    const content =
      data?.choices?.[0]?.message?.content ||
      fallback({
        type,
        trend,
        niche,
        language,
      });

    return NextResponse.json({
      success: true,
      content,
      mode: "ai",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Generation failed",
      },
      { status: 500 }
    );
  }
}

function fallback(input: {
  type: "caption" | "bio" | "reel";
  trend: string;
  niche: string;
  language: string;
}) {
  if (input.type === "bio") {
    return `✨ ${input.niche}
🎬 Stories • Ideas • Trends
📍 Creating my own way
👇 Follow the journey`;
  }

  if (input.type === "reel") {
    return `🔥 REEL IDEA

HOOK:
"${input.trend} — here's what everyone is talking about."

SCENE 1:
Show the trend/context.

SCENE 2:
Give your niche-specific perspective.

SCENE 3:
End with your takeaway.

CTA:
"What do you think? 👇"

CAPTION:
"${input.trend} is everywhere right now. Here's my take 👀"`;
  }

  return `🔥 ${input.trend}

Everyone seems to be talking about this right now 👀

Here's the interesting part:

Turn this trend into your own ${input.niche} angle instead of simply copying what everyone else is doing.

What do you think? 👇

#trending #reels #instagram #${input.niche
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")}`;
}
