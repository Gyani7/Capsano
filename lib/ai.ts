export async function generateWithAI(input:{type:"caption"|"bio"|"ideas";trend:string;niche:string;language:string;profile:string}){const key=process.env.OPENAI_API_KEY;if(!key)return fallback(input);const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model:"gpt-4o-mini",temperature:.8,messages:[{role:"system",content:`You are TrendPulse AI. Generate original creator content. Never guarantee virality. For political/current-affairs topics, keep wording factual and non-persuasive. Language: ${input.language}.`},{role:"user",content:`Type: ${input.type}
Trend: ${input.trend}
Niche: ${input.niche}
Profile DNA: ${input.profile}
Create polished Instagram-ready content.`}]})});if(!r.ok)return fallback(input);const j=await r.json();return j.choices?.[0]?.message?.content||fallback(input)}function fallback(i:{type:string;trend:string;niche:string;language:string;profile:string}){if(i.type==="bio")return `📍 Brasil 🇧🇷
✨ ${i.niche||"Vida real, histórias e momentos"}
🍯 Um pouco de mim todos os dias
👀 Vem me conhecer melhor nos stories`;if(i.type==="ideas")return `🎬 Reel: conte o contexto de “${i.trend}” em 3 cenas.
🪝 Hook: “Você também percebeu isso?”
💬 CTA: “Qual é a sua experiência? Conta nos comentários.”`;return `🚨 ${i.trend} 🚨

Esse assunto está chamando atenção agora. 👀

${i.niche?`Ângulo para ${i.niche}:`:"Ângulo para creators:"}
Explique o contexto, dê sua perspectiva e termine com uma pergunta simples. ✨

E você, o que acha? 👇`}}