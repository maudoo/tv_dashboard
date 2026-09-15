import "./style.css";

// Pure, per-second recompute driven by the `time` prop. No refs, no rAF loop —
// which is what caused the old countdown to freeze on "Now" and show a stale
// label. Cheap: one Date diff per render, and App already ticks every second.
export default function Countdown({ prayerList, currentPrayer, time }) {
  if (!currentPrayer || prayerList.length === 0) {
    return <div className="countdownNumber">…</div>;
  }

  const toDateTime = (str) => {
    const [h, m] = str.split(":").map(Number);
    const dt = new Date(time);
    dt.setHours(h, m, 0, 0);
    return dt;
  };

  const index = prayerList.findIndex((p) => p.name === currentPrayer.name);
  const current = prayerList[index];
  const iqamahTime = current?.iqamah ? toDateTime(current.iqamah) : null;

  let target;
  let label;
  if (iqamahTime && iqamahTime > time) {
    target = iqamahTime;
    label = `${current.name} Iqamah`;
  } else {
    const next = prayerList[(index + 1) % prayerList.length];
    target = toDateTime(next.adhan);
    // After the last prayer, "next" wraps to the first (tomorrow's Fajr),
    // whose time today is already past — roll it forward a day.
    if (target <= time) target.setDate(target.getDate() + 1);
    label = next.name;
  }

  const diff = target - time;
  const pad = (n) => String(n).padStart(2, "0");
  const display =
    diff <= 0
      ? "Now"
      : `${pad(Math.floor(diff / 3600000))}:${pad(
          Math.floor((diff % 3600000) / 60000)
        )}:${pad(Math.floor((diff % 60000) / 1000))}`;

  return (
    <div>
      <div className="countdownText">
        {label} in <br />
      </div>
      <div className="countdownNumber">{display}</div>
    </div>
  );
}
