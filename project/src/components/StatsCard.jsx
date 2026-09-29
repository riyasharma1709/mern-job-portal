export default function StatsCard({ title, count }) {
  return (
    <div className="stats-card">
      <h3>{count}</h3>
      <p>{title}</p>
    </div>
  );
}
