import "./style.css";

export default function HijriDate({ time }) {
  function formatHijriDate(date) {
    return date.toLocaleDateString("en-US-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="gregorian-hijri">
      <strong>{formatHijriDate(time)}</strong>
    </div>
  );
}
