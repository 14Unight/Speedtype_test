import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand Section */}
          <div className={styles.brand}>
            <h3 className={styles.brandName}>TypeRacer Pro</h3>
            <p className={styles.brandDescription}>
              Test your typing speed and accuracy with real-time WPM tracking. 
              Improve your keyboard skills with comprehensive analytics.
            </p>
          </div>

          {/* Links Section */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Product</h4>
              <ul className={styles.linkList}>
                <li><a href="/test" className={styles.link}>Typing Test</a></li>
                <li><a href="/leaderboard" className={styles.link}>Leaderboard</a></li>
                <li><a href="/profile" className={styles.link}>Profile</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Resources</h4>
              <ul className={styles.linkList}>
                <li><a href="/about" className={styles.link}>About</a></li>
                <li><a href="/privacy" className={styles.link}>Privacy Policy</a></li>
                <li><a href="/terms" className={styles.link}>Terms of Service</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Connect</h4>
              <div className={styles.socialLinks}>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="GitHub"
                >
                  <Github className={styles.socialIcon} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Twitter"
                >
                  <Twitter className={styles.socialIcon} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} TypeRacer Pro. Made with{' '}
              <Heart className={styles.heartIcon} /> by the community.
            </p>
          </div>
          
          <div className={styles.legal}>
            <p>
              Built with React, Node.js, and MariaDB. 
              Open source and available for contribution.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
