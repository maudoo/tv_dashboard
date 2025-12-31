import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import paths from "../paths.json";
import styles from "./slideshow.module.css";
import React from "react";

export default function Slideshow({ time, jummahInfo }) {
  const [on, setOn] = useState(false);
  const [media, setMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const stopTimeoutRef = useRef(null);


  const mediaURL = paths.LoadImages[0];

  const fetchMedia = async (retries = 5, delay = 3000) => {
    try {
      const res = await fetch(mediaURL);
      if (!res.ok) throw new Error("Media API unavailable");
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.warn(`Retrying fetchMedia... (${retries} left)`, err);
      if (retries > 0) {
        setTimeout(() => fetchMedia(retries - 1, delay), delay);
      } else {
        console.error("Failed to fetch media after multiple attempts.");
      }
    }
  };

  useEffect(() => {
    fetchMedia(); // initial fetch
  }, []);

  useEffect(() => {
    if (!on && media.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (prevIndex) => (prevIndex + 1) % media.length;
        setCurrentIndex((prev) => {
          const newIndex = nextIndex(prev);
          if (newIndex === 0) fetchMedia(); // refresh at start of new loop
          return newIndex;
        });
      }, 5000); // 5 second delay

      return () => clearInterval(interval);
    }
  }, [on, media]);

  // 🕌 Auto webcam for Jummah khutbah
  useEffect(() => {
    if (!jummahInfo?.khutbah || time.getDay() !== 5) return;

    const [khutbahHour, khutbahMinute] = jummahInfo.khutbah
      .split(":")
      .map(Number);
    const khutbahTime = new Date(time);
    khutbahTime.setHours(khutbahHour, khutbahMinute, 0, 0);

    const now = new Date(time);

    if (!on && Math.abs(now - khutbahTime) < 1000) {
      setOn(true);
      stopTimeoutRef.current = setTimeout(() => {
        setOn(false);
      }, 45 * 60 * 1000); // 45 minutes
    }
  }, [time, jummahInfo, on]);

  useEffect(() => {
    return () => clearTimeout(stopTimeoutRef.current);
  }, []);


  // const [deviceId, setDeviceId] = React.useState({});
  const [devices, setDevices] = React.useState([]);

  
  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ deviceId}) => deviceId=== '5e38a3207e249ec7d6c1ab3ede4ac68beb7ffd040b2ed45449ae6a727db32bdd')),
    [setDevices]
);

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
      console.log(devices);
      
      
    },
    [handleDevices,on]
  );

  const videoConstraints = {
    width: 1280,
  height: 720
  }

  return (
    <button className={styles.buttonWrapper} onClick={() => setOn(!on)}>
      {on ? (
        <Webcam  videoConstraints={videoConstraints} imageSmoothing={true} className={`${styles.live} ${styles.scale}`} mirrored={true}  />
      ) : (
        media.length > 0 && (
          <>
            {/\.mp4(\?|$)/i.test(media[currentIndex]) ? (
              <video
                className={styles.live}
                src={media[currentIndex]}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                className={styles.live}
                src={media[currentIndex]}
                alt={`slide-${currentIndex}`}
              />
            )}
          </>
        )
      )}
    </button>
  );
}
