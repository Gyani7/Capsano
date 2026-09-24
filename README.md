# TrendPulse AI

Fresh Next.js 14 project for trend intelligence + personalized creator content.

## Run
`npm install`
`npm run dev`

Copy `.env.example` to `.env.local`. Add `OPENAI_API_KEY` for AI generation; without it a fallback generator works.

Run `supabase/schema.sql` in Supabase SQL Editor. Import the repo into Vercel. `vercel.json` schedules the trend refresh endpoint every 2 hours.

### Important
The included feed is a starter/demo signal layer. It does not scrape Instagram and does not claim guaranteed virality. Replace `lib/trends.ts` with a legitimate current trend provider/API, then normalize source URLs/timestamps and score heat, growth, freshness and niche relevance.
