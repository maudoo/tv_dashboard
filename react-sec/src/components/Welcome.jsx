import logo from "../assets/logo.svg";
import styles from "./welcome.module.css";

export default function Welcome() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img className={styles.image} src={logo} alt="" />
      </div>
      <div className={styles.messageContainer}>
        <h1 className={styles.message}>Salaam!</h1>
      </div>
      
    </div>
  );
}
