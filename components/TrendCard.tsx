import { Trend } from "../lib/demo";

type TrendCardProps = {
  trend: Trend;
};

export default function TrendCard({ trend }: TrendCardProps) {
  return (
    <div className="trend">
      <div className="rank">#{trend.id}</div>

      <div className="trendmain">
        <div className="trendtitle">
          {trend.title}
        </div>

        <div className="trendmeta">
          <span className="tag">
            {trend.category}
          </span>

          <span className="tag">
            {trend.platform}
          </span>

          <span className="tag">
            🇧🇷 {trend.country}
          </span>

          <span className="tag">
            {trend.freshness}
          </span>
        </div>

        <div
          className="muted tiny"
          style={{ marginTop: 8 }}
        >
          {trend.summary}
        </div>
      </div>

      <div className="signal">
        <div className="heat">
          {trend.heat}
        </div>

        <div className="tiny muted">
          signal
        </div>

        <div className="bar">
          <i
            style={{
              width: `${trend.heat}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
