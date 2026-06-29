'use client';

import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Key is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Successful login - redirect to dashboard using hard reload to clear cache
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid passcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridBackground} />
      
      <div className={styles.loginCard}>
        <div className={styles.iconWrapper}>
          <Shield size={32} />
        </div>
        
        <h1 className={styles.title}>VOLEEE</h1>
        <p className={styles.subtitle}>Secure Admin Operations Gate</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Security Passcode</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className={styles.errorText}>
                <span>✕</span> {error}
              </p>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <div className={styles.footerInfo}>
          <Shield size={12} />
          <span>SSL Secured • AES-256 Memory Guard</span>
        </div>
      </div>
    </div>
  );
}
