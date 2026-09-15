import { useEffect, useState } from "react";
import { config } from "../config";
import PrayerCard from "./PrayerCard";

import asrIcon from "../assets/asr.png";
import dhuhrIcon from "../assets/dhuhr.png";
import ishaIcon from "../assets/isha.png";
import maghribIcon from "../assets/maghrib.png";
import { default as fajrIcon, default as sunriseIcon } from "../assets/sunrise.png";

// strips timezone suffix from aladhan times e.g. "05:20 (CDT)" → "05:20"
const hm = (t) => (t || "").split(" ")[0];

export default function PrayerList({
  time,
  prayerList,
  setPrayerList,
  setCurrentPrayer,
  currentPrayer,
  setJummahInfo,
}) {
  const [lastFetchedDay, setLastFetchedDay] = useState(null);

  const fetchPrayerTimes = async (retries = 5, delay = 5000) => {
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${config.city}&country=${config.country}&method=${config.method}&school=${config.school}`
      );
      if (!res.ok) throw new Error("aladhan fetch failed");
      const result = await res.json();
      const timings = result.data.timings;

      let iqamah = {};
      try {
        const iqamahRes = await fetch(config.iqamahsUrl);
        if (iqamahRes.ok) iqamah = await iqamahRes.json();
      } catch {
        // fall back to empty iqamahs
      }

      const isFriday = new Date().getDay() === 5;

      const combined = [
        { name: "Fajr",    adhan: hm(timings.Fajr),    iqamah: iqamah.Fajr    || "", icon: fajrIcon },
        { name: "Sunrise", adhan: hm(timings.Sunrise),  iqamah: null,                 icon: sunriseIcon },
        isFriday && iqamah["Jummah Iqamah"]
          ? {
              name: "Jummah",
              adhan: iqamah["Jummah Khutbah"] || hm(timings.Dhuhr),
              iqamah: iqamah["Jummah Iqamah"] || "",
              khutbah: iqamah["Jummah Khutbah"] || "",
              icon: dhuhrIcon,
            }
          : { name: "Dhuhr", adhan: hm(timings.Dhuhr), iqamah: iqamah.Dhuhr || "", icon: dhuhrIcon },
        { name: "Asr",     adhan: hm(timings.Asr),     iqamah: iqamah.Asr     || "", icon: asrIcon },
        { name: "Maghrib", adhan: hm(timings.Maghrib),  iqamah: iqamah.Maghrib || "", icon: maghribIcon },
        { name: "Isha",    adhan: hm(timings.Isha),     iqamah: iqamah.Isha    || "", icon: ishaIcon },
      ].filter(Boolean);

      setJummahInfo(
        iqamah["Jummah Iqamah"]
          ? {
              name: "Jummah",
              adhan: iqamah["Jummah Khutbah"] || hm(timings.Dhuhr),
              iqamah: iqamah["Jummah Iqamah"] || "",
              khutbah: iqamah["Jummah Khutbah"] || "",
            }
          : null
      );

      setPrayerList(combined);
      setLastFetchedDay(new Date().toDateString());
    } catch (err) {
      console.warn("Retrying fetchPrayerTimes...", retries, "left");
      if (retries > 0) setTimeout(() => fetchPrayerTimes(retries - 1, delay), delay);
    }
  };

  // refetch when the day changes
  useEffect(() => {
    const today = time.toDateString();
    if (today !== lastFetchedDay) fetchPrayerTimes();
  }, [time.toDateString()]);

  // update current prayer every second
  useEffect(() => {
    if (prayerList.length === 0 || !time) return;

    let current = null;
    for (const { name, adhan } of prayerList) {
      if (!adhan || name === "Sunrise") continue;
      const [h, m] = adhan.split(":").map(Number);
      const prayerTime = new Date(time);
      prayerTime.setHours(h, m, 0, 0);
      if (time >= prayerTime) current = { name, adhan };
    }

    if (!current) {
      const isha = prayerList.find((p) => p.name === "Isha");
      if (isha) current = { name: isha.name, adhan: isha.adhan };
    }

    setCurrentPrayer(current);
  }, [time, prayerList]);

  return (
    <div>
      <div>
        <PrayerCard prayerList={prayerList} currentPrayer={currentPrayer} />
      </div>
    </div>
  );
}
