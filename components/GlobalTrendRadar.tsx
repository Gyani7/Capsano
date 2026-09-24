"use client";

import { useEffect, useMemo, useState } from "react";

type Trend = {
  id: string;
  title: string;
  source: string;
  country: string;
  signal: "Viral" | "Rising" | "Early";
  traffic?: string;
  description?: string;
};

const countries = [
  { code: "IN", name: "🇮🇳 India" },
  { code: "US", name: "🇺🇸 USA" },
  { code: "BR", name: "🇧🇷 Brazil" },
  { code: "GB", name: "🇬🇧 UK" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "CA", name: "🇨🇦 Canada" },
];

export default function GlobalTrendRadar() {
  const [country, setCountry] = useState("IN");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [niche, setNiche] = useState("Creator");
  const [language, setLanguage] = useState("English");

  const [output, setOutput] = useState("");
  const [outputType, setOutputType] =
    useState<"caption" | "bio" | "reel">("caption");

  async function loadTrends(selectedCountry = country) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/global-trends?country=${selectedCountry}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setTrends(data.trends || []);
      }
    } catch {
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrends(country);
  }, [country]);

  const viral = useMemo(
    () => trends.filter((trend) => trend.signal === "Viral"),
    [trends]
  );

  const rising = useMemo(
    () => trends.filter((trend) => trend.signal === "Rising"),
    [trends]
  );

  const early = useMemo(
    () => trends.filter((trend) => trend.signal === "Early"),
    [trends]
  );

  async function generate(type: "caption" | "bio" | "reel") {
    if (!selectedTrend) return;

    setOutputType(type);
    setGenerating(true);
    setOutput("");

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          trend: selectedTrend.title,
          niche,
          language,
        }),
      });

      const data = await response.json();

      setOutput(
        data.content || "Unable to generate content."
      );
    } catch {
      setOutput("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  function TrendCard({ trend }: { trend: Trend }) {
    const active = selectedTrend?.id === trend.id;

    return (
      <button
        type="button"
        onClick={() => setSelectedTrend(trend)}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          active
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs text-white/40">
            {trend.source}
          </span>

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              trend.signal === "Viral"
                ? "bg-red-500/15 text-red-300"
                : trend.signal === "Rising"
                ? "bg-yellow-500/15 text-yellow-300"
                : "bg-green-500/15 text-green-300"
            }`}
          >
            {trend.signal}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {trend.title}
        </h3>

        {trend.traffic && (
          <p className="mt-2 text-xs text-white/40">
            {trend.traffic}
          </p>
        )}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080c] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-2 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            GLOBAL TREND ENGINE
          </div>

          <h1 className="text-3xl font-bold md:text-5xl">
            What is trending
            <span className="text-purple-400"> right now?</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Discover fresh trend signals and turn them into
            creator-specific captions, bios and Reel ideas.
          </p>
        </div>

        {/* COUNTRY */}

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {countries.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setCountry(item.code)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm ${
                country === item.code
                  ? "border-purple-500 bg-purple-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60"
              }`}
            >
              {item.name}
            </button>
          ))}

          <button
            type="button"
            onClick={() => loadTrends()}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            ↻ Refresh
          </button>
        </div>

        {/* RADAR */}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="animate-pulse text-white/50">
              Scanning global trend signals...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">
                  🔥 Viral
                </h2>

                <span className="text-xs text-white/30">
                  {viral.length}
                </span>
              </div>

              <div className="space-y-3">
                {viral.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">
                  📈 Rising
                </h2>

                <span className="text-xs text-white/30">
                  {rising.length}
                </span>
              </div>

              <div className="space-y-3">
                {rising.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">
                  💎 Early
                </h2>

                <span className="text-xs text-white/30">
                  {early.length}
                </span>
              </div>

              <div className="space-y-3">
                {early.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* GENERATOR */}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-8">
          <div className="mb-6">
            <span className="text-xs font-semibold text-purple-400">
              TREND → CONTENT
            </span>

            <h2 className="mt-2 text-2xl font-bold">
              Turn a trend into your content
            </h2>
          </div>

          {!selectedTrend ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
              Select a trend above to start creating.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* SELECTED */}

              <div>
                <p className="mb-2 text-xs text-white/40">
                  SELECTED TREND
                </p>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                  <div className="mb-3 text-xs text-purple-300">
                    {selectedTrend.source}
                  </div>

                  <h3 className="text-lg font-bold">
                    {selectedTrend.title}
                  </h3>

                  {selectedTrend.description && (
                    <p className="mt-3 text-sm text-white/50">
                      {selectedTrend.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-3">
                  <input
                    value={niche}
                    onChange={(e) =>
                      setNiche(e.target.value)
                    }
                    placeholder="Your niche e.g. Fashion, Fitness..."
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-500"
                  />

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-sm outline-none"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Hinglish</option>
                    <option>Portuguese</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}

              <div>
                <p className="mb-3 text-xs text-white/40">
                  CREATE
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => generate("caption")}
                    className="rounded-xl bg-purple-600 px-3 py-3 text-sm font-semibold hover:bg-purple-500"
                  >
                    Caption
                  </button>

                  <button
                    type="button"
                    onClick={() => generate("bio")}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-semibold"
                  >
                    Bio
                  </button>

                  <button
                    type="button"
                    onClick={() => generate("reel")}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-semibold"
                  >
                    Reel
                  </button>
                </div>

                <div className="mt-4 min-h-[280px] rounded-2xl border border-white/10 bg-black/20 p-5">
                  {generating ? (
                    <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-white/40">
                      Creating your {outputType}...
                    </div>
                  ) : output ? (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-purple-400">
                          Generated {outputType}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(output)
                          }
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60"
                        >
                          Copy
                        </button>
                      </div>

                      <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-white/80">
                        {output}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex min-h-[240px] items-center justify-center text-center text-sm text-white/30">
                      Choose Caption, Bio or Reel.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SOURCES */}

        <div className="mt-6 text-center text-xs text-white/25">
          Trend signals are sourced from publicly available trend
          feeds. Refresh approximately every 2 hours.
        </div>
      </div>
    </main>
  );
}
