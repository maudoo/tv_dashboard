import styles from "./prayerCard.module.css";

export default function PrayerCard({ prayerList, currentPrayer }) {
  // Helper function to convert "HH:mm" to "hh:mm AM/PM"
  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className={styles.prayerCardContainer}>
      {prayerList.map((prayer) => (
        <div
          key={prayer.name}
          className={
            currentPrayer?.name === prayer.name
              ? styles.activeprayer
              : styles.prayerCard
          }
        >
          <div className={styles.prayerName}>{prayer.name}</div>
          <img
            src={prayer.icon}
            alt={`${prayer.name} icon`}
            className={styles.icon}
          />
          <div className={styles.prayerTime}>
            {formatTime12Hour(prayer.adhan)}
          </div>
          {prayer.iqamah && (
            <div className={styles.iqamah}>
              Iqamah: {formatTime12Hour(prayer.iqamah)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
