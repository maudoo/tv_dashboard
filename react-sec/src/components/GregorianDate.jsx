import "./style.css";

export default function GregorianDate({ time }) {
  function formatGregorianDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="gregorian-hijri">
      <strong>{formatGregorianDate(time)}</strong>
    </div>
  );
}
