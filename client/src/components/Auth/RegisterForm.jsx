import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/utils/validators.js';
import { useAuthHook } from '@/hooks/useAuth.js';
import { Eye, EyeOff, UserPlus, AlertCircle, Check, X } from 'lucide-react';
import styles from './RegisterForm.module.css';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuthHook();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      // Handle unexpected errors
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicators
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'Weak', color: '#ef4444' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const strengthMap = {
      0: { label: 'Weak', color: '#ef4444' },
      1: { label: 'Weak', color: '#ef4444' },
      2: { label: 'Fair', color: '#f97316' },
      3: { label: 'Good', color: '#eab308' },
      4: { label: 'Strong', color: '#22c55e' },
      5: { label: 'Very Strong', color: '#22c55e' }
    };

    return { score, ...strengthMap[score] };
  };

  const passwordStrength = getPasswordStrength(password);

  const requirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd) => /\d/.test(pwd) },
    { label: 'One special character', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Join TypeRacer Pro to track your progress and compete with others
          </p>
        </div>

        {errors.root && (
          <div className={styles.errorAlert}>
            <AlertCircle className={styles.errorIcon} />
            <span>{errors.root.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`${styles.input} ${errors.username ? styles.error : ''}`}
              placeholder="Choose a username"
              {...register('username')}
              disabled={isLoading}
            />
            {errors.username && (
              <p className={styles.errorMessage}>{errors.username.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className={styles.errorMessage}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordInput}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.passwordField} ${errors.password ? styles.error : ''}`}
                placeholder="Create a strong password"
                {...register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className={styles.toggleIcon} />
                ) : (
                  <Eye className={styles.toggleIcon} />
                )}
              </button>
            </div>
            
            {password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span 
                  className={styles.strengthText}
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {errors.password && (
              <p className={styles.errorMessage}>{errors.password.message}</p>
            )}

            {password && (
              <div className={styles.requirements}>
                <p className={styles.requirementsTitle}>Password requirements:</p>
                <ul className={styles.requirementsList}>
                  {requirements.map((req, index) => (
                    <li key={index} className={styles.requirement}>
                      {req.test(password) ? (
                        <Check className={styles.checkIcon} />
                      ) : (
                        <X className={styles.xIcon} />
                      )}
                      <span className={req.test(password) ? styles.met : styles.unmet}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.buttonLoader}>
                <div className={styles.spinner}></div>
              </div>
            ) : (
              <>
                <UserPlus className={styles.buttonIcon} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
