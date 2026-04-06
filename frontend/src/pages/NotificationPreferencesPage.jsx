import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/NotificationPreferencesPage.css';

export default function NotificationPreferencesPage() {
  const { user, updateUser } = useAuth();
  const { certs, refreshCerts, updateReminderPreference } = useData();
  
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [frequency, setFrequency] = useState('single'); // single or weekly
  const [disabledCertifications, setDisabledCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  useEffect(() => {
    if (!user) return;
    setRemindersEnabled(user.notificationsEnabled !== false);
    setFrequency(user.notificationFrequency || 'single');
  }, [user]);

  const loadCertifications = async () => {
    try {
      await refreshCerts();
    } catch (err) {
      console.error('Failed to load certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certs.length > 0) {
      const backendDisabled = certs
        .filter(c => c.remindersDisabled)
        .map(c => c.certId || c.id);
      setDisabledCertifications(backendDisabled);
    }
  }, [certs]);

  const savePreferences = async () => {
    try {
      const res = await api.put('/api/auth/preferences/notifications', {
        notificationsEnabled: remindersEnabled,
        notificationFrequency: frequency,
      });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const toggleCertificationReminders = async (certId) => {
    const currentlyDisabled = disabledCertifications.includes(certId);
    const nextDisabled = !currentlyDisabled;

    if (currentlyDisabled) {
      setDisabledCertifications(disabledCertifications.filter(id => id !== certId));
    } else {
      setDisabledCertifications([...disabledCertifications, certId]);
    }

    try {
      await updateReminderPreference(certId, nextDisabled);
    } catch (err) {
      console.error('Failed to update reminder preference:', err);
      // rollback optimistic update
      if (currentlyDisabled) {
        setDisabledCertifications(prev => [...prev, certId]);
      } else {
        setDisabledCertifications(prev => prev.filter(id => id !== certId));
      }
    }
  };

  return (
    <div className="fade-up">
        <div className="notification-prefs-container">
          <div className="prefs-header">
            <h1>📬 Notification Preferences</h1>
            <p>Manage how and when you receive certification reminders</p>
          </div>

          {loading && <div className="page-subtitle" style={{ marginBottom: 16 }}>Loading preferences...</div>}

          {/* Global Settings */}
          <div className="prefs-section">
            <h2>Global Settings</h2>
            
            <div className="pref-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="toggle-info">
                <h3>Enable Email Reminders</h3>
                <p>Receive automatic email notifications when your certifications are about to expire</p>
              </div>
            </div>

            {remindersEnabled && (
              <>
                <div className="pref-item">
                  <label>Reminder Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="single">Individual emails for each reminder</option>
                    <option value="weekly">Weekly digest (all reminders in one email)</option>
                  </select>
                  <p className="help-text">
                    {frequency === 'single' 
                      ? 'You\'ll receive separate emails at 30, 14, 7, and 1 days before expiry'
                      : 'You\'ll receive a weekly summary every Monday with all expiring certifications'}
                  </p>
                </div>

                <div className="pref-item">
                  <label>Reminder Timeline</label>
                  <div className="reminder-timeline">
                    {[1, 7, 14, 30].map(days => (
                      <div key={days} className="reminder-badge">
                        <span>{days}d</span>
                      </div>
                    ))}
                  </div>
                  <p className="help-text">You'll receive reminders 1, 7, 14, and 30 days before expiry</p>
                </div>
              </>
            )}
          </div>

          {/* Per-Certification Settings */}
          {remindersEnabled && certs.length > 0 && (
            <div className="prefs-section">
              <h2>Per-Certification Settings</h2>
              <p className="section-desc">Toggle reminders for individual certifications</p>
              
              <div className="certs-list">
                {certs.map(cert => (
                  <div key={cert.certId || cert.id} className="cert-pref-item">
                    <div className="cert-info">
                      <h4>{cert.certName}</h4>
                      <p>{cert.issuedBy}</p>
                      <span className="expiry-info">
                        Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={!disabledCertifications.includes(cert.certId || cert.id)}
                        onChange={() => toggleCertificationReminders(cert.certId || cert.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Notification Examples */}
          <div className="prefs-section info-section">
            <h2>📧 What You'll Receive</h2>
            <div className="examples">
              <div className="example-card">
                <span className="example-label">30 Days Before</span>
                <p>"Your certification 'AWS Solutions Architect' expires in 30 days on April 28, 2026"</p>
              </div>
              <div className="example-card">
                <span className="example-label">7 Days Before</span>
                <p>"Your certification 'AWS Solutions Architect' expires in 7 days on April 28, 2026"</p>
              </div>
              <div className="example-card">
                <span className="example-label">1 Day Before</span>
                <p>"⚠️ Your certification 'AWS Solutions Architect' expires TOMORROW on April 28, 2026"</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="prefs-section privacy-section">
            <h3>🔒 Privacy</h3>
            <p>
              We only send emails to notify you about your certifications. 
              We never share your email with third parties. 
              <a href="#unsubscribe"> Unsubscribe anytime</a>
            </p>
          </div>

          {/* Save Button */}
          <div className="prefs-actions">
            <button className="btn-save" onClick={savePreferences}>
              💾 Save Preferences
            </button>
            {saved && <span className="save-confirmation">✅ Preferences saved successfully!</span>}
          </div>
        </div>
    </div>
  );
}
