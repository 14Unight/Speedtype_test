import React from 'react';
import styles from './Loader.module.css';

export const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className={styles.pageLoader}>
    <Loader size="large" text="Loading application..." />
  </div>
);

export const ButtonLoader = () => (
  <div className={styles.buttonLoader}>
    <div className={styles.smallSpinner}></div>
  </div>
);
