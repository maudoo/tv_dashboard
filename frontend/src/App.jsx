import { useEffect, useState } from "react";
import "./App.css";
import Admin from "./components/Admin";
import Clock from "./components/Clock";
import Countdown from "./components/Countdown";
import GregorianDate from "./components/GregorianDate";
import HijriDate from "./components/HijriDate";
import PrayerList from "./components/PrayerList";
import Slideshow from "./components/Slideshow";
import Welcome from "./components/Welcome";

export default function App() {
  const [time, setTime] = useState(new Date());
  const [prayerList, setPrayerList] = useState([]);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [jummahInfo, setJummahInfo] = useState(null);

  useEffect(() => {
    const fit = () =>
      document.documentElement.style.setProperty(
        "--scale",
        String(Math.min(window.innerWidth / 1280, window.innerHeight / 720))
      );
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (window.location.hash === "#/admin") return <Admin />;

  return (
    <div className="fit-wrapper">
      <div className="dashboard">
        <div className="supplication">
          <Slideshow time={time} jummahInfo={jummahInfo} />
        </div>

        <div className="countdown"></div>

        <div className="info">
          <Welcome />
          <hr className="divider" />
          <Clock time={time} />
          <hr className="divider" />
          <GregorianDate time={time} />
          <HijriDate time={time} />
          <hr className="divider" />
          <Countdown
            prayerList={prayerList}
            currentPrayer={currentPrayer}
            jummahInfo={jummahInfo}
            time={time}
          />
        </div>

        <div className="prayerbar">
          <PrayerList
            time={time}
            prayerList={prayerList}
            setPrayerList={setPrayerList}
            currentPrayer={currentPrayer}
            setCurrentPrayer={setCurrentPrayer}
            setJummahInfo={setJummahInfo}
          />
        </div>
      </div>
    </div>
  );
}
