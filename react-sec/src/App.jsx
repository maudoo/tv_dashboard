import { useEffect, useState } from "react";
import "./App.css";
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
  const [nextPrayer, setNextPrayer] = useState(null); // not used but can be useful for later features
  const [jummahInfo, setJummahInfo] = useState(null);

  
  

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fit-wrapper">
      <div className="dashboard">
        <div className="supplication">
          <Slideshow time={time} jummahInfo={jummahInfo}/>
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
            setNextPrayer={setNextPrayer}
            setJummahInfo={setJummahInfo}
          />
        </div>
      </div>
    </div>
  );
}
