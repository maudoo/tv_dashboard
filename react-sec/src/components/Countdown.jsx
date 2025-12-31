import { useEffect, useRef, useState } from "react";
import "./style.css";

export default function Countdown({ prayerList, currentPrayer, time }) {
  const [display, setDisplay] = useState("...");
  const targetRef = useRef(null);
  const labelRef = useRef("");

  const toDateTime = (str) => {
    const [h, m] = str.split(":").map(Number);
    const dt = new Date(time);
    dt.setHours(h, m, 0, 0);
    return dt;
  };

  useEffect(() => {
    if (!currentPrayer || prayerList.length === 0) return;

    const index = prayerList.findIndex((p) => p.name === currentPrayer.name);
    const now = new Date();

    const current = prayerList[index];
    const iqamahTime = current.iqamah ? toDateTime(current.iqamah) : null;
    // const adhanTime = toDateTime(current.adhan);

    if (iqamahTime && iqamahTime > now) {
      targetRef.current = iqamahTime;
      labelRef.current = `${current.name} Iqamah`;
    } else {
      const next = prayerList[(index + 1) % prayerList.length];
      targetRef.current = toDateTime(next.adhan);
      labelRef.current = `${next.name}`;
    }
  }, [currentPrayer, prayerList, time]);

  useEffect(() => {
    let frameId;

    const updateCountdown = () => {
      const now = new Date();
      const target = targetRef.current;
      if (!target) return;



      const diff = (target - now);
      if (diff <= 0) {
        setDisplay("...");
        return;
      }

      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
        2,
        "0"
      );
      const mins = String(
        Math.floor((diff % (1000 * 60 * 60)) / 60000)
      ).padStart(2, "0");
      const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setDisplay(`${hours}:${mins}:${secs}`);
      frameId = requestAnimationFrame(updateCountdown);
    };

    frameId = requestAnimationFrame(updateCountdown);
    return () => cancelAnimationFrame(frameId);
  }, [targetRef.current]);

  return (
    <div>
      <div className="countdownText">
        {labelRef.current} in <br />
      </div>
      <div className="countdownNumber">
        {display}
      </div>
    </div>
  );
}
