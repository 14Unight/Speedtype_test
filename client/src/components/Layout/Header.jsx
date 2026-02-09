import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthHook } from '@/hooks/useAuth.js';
import { User, LogOut, Menu, X, Trophy, BarChart3, Home, BookOpen } from 'lucide-react';
import styles from './Header.module.css';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthHook();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Test', href: '/test', icon: BookOpen, current: location.pathname === '/test' },
  ];

  const protectedNavigation = [
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, current: location.pathname === '/leaderboard' },
    { name: 'Profile', href: '/profile', icon: BarChart3, current: location.pathname === '/profile' },
  ];

  const allNavigation = isAuthenticated ? [...navigation, ...protectedNavigation] : navigation;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <Trophy className={styles.logoIcon} />
          <span>TypeRacer Pro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {allNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${styles.navLink} ${item.current ? styles.active : ''}`}
              >
                <Icon className={styles.navIcon} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <User className={styles.userIcon} />
                <span className={styles.userName}>{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Logout"
              >
                <LogOut className={styles.logoutIcon} />
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={styles.menuIcon} />
          ) : (
            <Menu className={styles.menuIcon} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavContainer}>
            {allNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${styles.mobileNavLink} ${item.current ? styles.active : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Icon className={styles.mobileNavIcon} />
                  {item.name}
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <div className={styles.mobileUserSection}>
                <div className={styles.mobileUserInfo}>
                  <User className={styles.mobileUserIcon} />
                  <span>{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={styles.mobileLogoutButton}
                >
                  <LogOut className={styles.mobileLogoutIcon} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
