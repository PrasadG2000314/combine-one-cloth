'use client';

import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar() {
  const messages = [
    'ORDERS WILL TAKE 4 TO 6 WORKING DAYS FOR DELIVERY',
    'FREE SHIPPING FOR ORDERS ABOVE Rs.9999.00',
  ];

  const repeated = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        {repeated.map((msg, i) => (
          <span key={i} className={styles.message}>
            {msg}
            <span className={styles.separator}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
