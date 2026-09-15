import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { config } from "../config";
import styles from "./slideshow.module.css";

export default function Slideshow({ time, jummahInfo }) {
  const [on, setOn] = useState(false);
  const [media, setMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const stopTimeoutRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((d) => d.kind === "videoinput");
      const preferred = cameras.find((d) => d.deviceId === config.webcamDeviceId);
      setDeviceId(preferred ? preferred.deviceId : cameras[0]?.deviceId || null);
    });
  }, []);

  const fetchMedia = async (retries = 5, delay = 3000) => {
    try {
      const res = await fetch(config.loadImagesUrl);
      if (!res.ok) throw new Error("Media API unavailable");
      setMedia(await res.json());
    } catch (err) {
      console.warn(`Retrying fetchMedia... (${retries} left)`, err);
      if (retries > 0) setTimeout(() => fetchMedia(retries - 1, delay), delay);
      else console.error("Failed to fetch media after multiple attempts.");
    }
  };

  // Initial load + periodic refresh, so new posters appear without disturbing
  // the rotation timer.
  useEffect(() => {
    fetchMedia();
    const refresh = setInterval(fetchMedia, 10 * 60 * 1000);
    return () => clearInterval(refresh);
  }, []);

  // Advance the slide. Keyed on media.length so a refresh returning the same
  // number of images doesn't reset the rotation mid-cycle.
  useEffect(() => {
    if (on || media.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, config.slideshowIntervalMs);
    return () => clearInterval(interval);
  }, [on, media.length]);

  // Preload the next image to avoid a decode flash on switch.
  useEffect(() => {
    if (media.length < 2) return;
    const next = media[(currentIndex + 1) % media.length];
    if (next && !/\.mp4(\?|$)/i.test(next)) new Image().src = next;
  }, [currentIndex, media]);

  // Auto-enable the webcam for the whole Jummah khutbah window. Uses a window
  // check (start ≤ now < start+duration) rather than an exact ±1s match, which
  // the once-a-second clock tick would usually miss.
  useEffect(() => {
    if (on || !jummahInfo?.khutbah || time.getDay() !== 5) return;

    const [h, m] = jummahInfo.khutbah.split(":").map(Number);
    const start = new Date(time);
    start.setHours(h, m, 0, 0);
    const end = start.getTime() + config.khutbahDurationMs;

    if (time.getTime() >= start.getTime() && time.getTime() < end) {
      setOn(true);
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = setTimeout(() => setOn(false), end - time.getTime());
    }
  }, [time, jummahInfo, on]);

  useEffect(() => () => clearTimeout(stopTimeoutRef.current), []);

  const src = media[currentIndex];

  return (
    <div className={styles.wrapper} onClick={() => setOn((prev) => !prev)}>
      {on ? (
        <Webcam
          videoConstraints={{ width: 1280, height: 720, deviceId: deviceId || undefined }}
          imageSmoothing
          className={styles.live}
          mirrored={true}
        />
      ) : (
        src &&
        (/\.mp4(\?|$)/i.test(src) ? (
          <video className={styles.live} src={src} autoPlay muted loop playsInline />
        ) : (
          <img
            key={currentIndex}
            className={`${styles.live} ${styles.fade}`}
            src={src}
            alt=""
          />
        ))
      )}
    </div>
  );
}
