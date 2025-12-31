// PrayerList.jsx
import { useEffect, useState } from "react";
import PrayerCard from "./PrayerCard";

import asrIcon from "../assets/asr.png";
import dhuhrIcon from "../assets/dhuhr.png";
import ishaIcon from "../assets/isha.png";
import maghribIcon from "../assets/maghrib.png";
import {
  default as fajrIcon,
  default as sunriseIcon,
} from "../assets/sunrise.png";
import paths from "../paths.json";

export default function PrayerList({
  time,
  prayerList,
  setPrayerList,
  setCurrentPrayer,
  currentPrayer,
  setNextPrayer,
  setJummahInfo,
}) {
  const [fetchedNewDay, setFetchedNewDay] = useState(false);



  const fetchPrayerTimes = async (retries = 5, delay = 5000) => {
    try {
      const res = await fetch(
        "https://api.aladhan.com/v1/timingsByCity?city=Chicago&country=US&method=2&school=1"
      );
      const result = await res.json();
      const timings = result.data.timings;
      const iqamahsURL = paths.Iqamahs[0];
      const iqamahRes = await fetch(iqamahsURL);
      const iqamah = await iqamahRes.json();

      const isFriday = new Date().getDay() === 5;

      const combined = [
        {
          name: "Fajr",
          adhan: timings.Fajr,
          iqamah: iqamah.Fajr || "",
          icon: fajrIcon,
        },
        {
          name: "Sunrise",
          adhan: timings.Sunrise,
          iqamah: null,
          icon: sunriseIcon,
        },
        isFriday && iqamah["Jummah Iqamah"]
          ? {
              name: "Jummah",
              adhan: iqamah["Jummah Khutbah"], // check this part again, hard coded this
              iqamah: iqamah["Jummah Iqamah"] || "",
              khutbah: iqamah["Jummah Khutbah"] || "",
              icon: dhuhrIcon, // or a custom jummah icon
            }
          : {
              name: "Dhuhr",
              adhan: timings.Dhuhr,
              iqamah: iqamah.Dhuhr || "",
              icon: dhuhrIcon,
            },
        {
          name: "Asr",
          adhan: timings.Asr,
          iqamah: iqamah.Asr || "",
          icon: asrIcon,
        },
        {
          name: "Maghrib",
          adhan: timings.Maghrib,
          iqamah: iqamah.Maghrib || "",
          icon: maghribIcon,
        },
        {
          name: "Isha",
          adhan: timings.Isha,
          iqamah: iqamah.Isha || "",
          icon: ishaIcon,
        },
      ].filter(Boolean); // In case any false value sneaks in

      if (iqamah["Jummah Iqamah"]) {
        setJummahInfo({
          name: "Jummah",
          adhan: iqamah["Jummah Khutbah"], // check this part again, hard coded this
          iqamah: iqamah["Jummah Iqamah"] || "",
          khutbah: iqamah["Jummah Khutbah"] || "",
        });
      } else {
        setJummahInfo(null);
      }

      setPrayerList(combined);
    } catch (err) {
      console.warn("Retrying fetchPrayerTimes...", retries, "left");
      if (retries > 0) {
        setTimeout(() => fetchPrayerTimes(retries - 1, delay), delay);
      } else {
        console.error("Failed to fetch after multiple attempts:", err);
      }
    }
  };
  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchedNewDay]);

  useEffect(() => {
    if (!time || prayerList.length === 0) return;

    const isha = prayerList.find((p) => p.name === "Isha");
    if (!isha || !isha.adhan) return;

    const [h, m] = isha.adhan.split(":").map(Number);
    const ishaTime = new Date(time);
    ishaTime.setHours(h, m, 0, 0);

    if (time >= ishaTime && !fetchedNewDay) {
      setFetchedNewDay(true);
    }
    if (time.getHours() < 2 && fetchedNewDay) {
      setFetchedNewDay(false);
    }
  }, [time, prayerList]);

  useEffect(() => {
    if (prayerList.length === 0 || !time) return;

    let current = null;
    let next = null;

    for (const { name, adhan } of prayerList) {
      if (!adhan) continue;

      const [hour, minute] = adhan.split(":").map(Number);
      const prayerTime = new Date(time);
      prayerTime.setHours(hour, minute, 0, 0);

      if (time >= prayerTime) {
        current = { name, adhan };
      } else if (!next && !next?.name) {
        next = { name, adhan };
        break; // once next is found, break early
      }
    }

    // Edge case: before Fajr (after Isha)
    if (!current) {
      const isha = prayerList.find((p) => p.name === "Isha");
      if (isha && isha.adhan) {
        current = { name: isha.name, adhan: isha.adhan };
      }
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  }, [time, prayerList]);

  return (
    <div>
      <div>
        <PrayerCard prayerList={prayerList} currentPrayer={currentPrayer} />
      </div>
    </div>
  );
}
