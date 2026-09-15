import { useEffect, useState } from "react";
import { config } from "../config";
import styles from "./admin.module.css";

const KEYS = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
  "Jummah Khutbah",
  "Jummah Iqamah",
];

export default function Admin() {
  const [times, setTimes] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(config.iqamahsUrl)
      .then((r) => r.json())
      .then(setTimes)
      .catch(() => setStatus("Couldn't load current times — is the backend running?"));
  }, []);

  if (!times) return <div className={styles.wrap}>{status || "Loading…"}</div>;

  const save = async (e) => {
    e.preventDefault();
    setStatus("Saving…");
    try {
      const res = await fetch(config.iqamahsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": password,
        },
        body: JSON.stringify(times),
      });
      if (res.status === 401) return setStatus("Wrong password.");
      if (!res.ok) return setStatus((await res.json()).error || "Save failed.");
      setStatus("Saved ✓");
      setTimeout(() => { window.location.hash = ""; }, 1500);
    } catch {
      setStatus("Network error — is the backend running?");
    }
  };

  return (
    <form className={styles.wrap} onSubmit={save}>
      <h1>Iqamah Times</h1>
      {KEYS.map((key) => (
        <label key={key} className={styles.row}>
          <span>{key}</span>
          <input
            type="time"
            value={times[key] || ""}
            onChange={(e) => setTimes({ ...times, [key]: e.target.value })}
          />
        </label>
      ))}
      <label className={styles.row}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Save</button>
      <div className={styles.status}>{status}</div>
    </form>
  );
}
