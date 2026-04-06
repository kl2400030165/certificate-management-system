import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RiUserLine, RiMailLine, RiShieldLine, RiAwardLine, RiBellLine, RiArrowRightLine } from 'react-icons/ri';
import { formatDate } from '../utils/certUtils';

const ProfilePage = () => {
    const { user } = useAuth();
    const { getMyCerts } = useData();
    const certs = getMyCerts();

    const active = certs.filter(c => c.status === 'ACTIVE').length;
    const expired = certs.filter(c => c.status === 'EXPIRED').length;
    const expiring = certs.filter(c => c.status === 'EXPIRING SOON').length;

    const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || '?';
    const joinDate = user?.createdAt ? formatDate(user.createdAt) : 'N/A';

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Your account information and summary</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="cert-view-card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                    {/* Avatar */}
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 0 0 4px rgba(14,165,233,0.2)'
                    }}>
                        {avatarLetter}
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RiShieldLine />
                            <span style={{
                                textTransform: 'capitalize',
                                color: user?.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                                fontWeight: 600
                            }}>{user?.role}</span> Account
                        </div>
                    </div>
                </div>

                <div className="cert-details-grid">
                    <div className="cert-detail-item">
                        <label><RiUserLine style={{ marginRight: 4 }} />Full Name</label>
                        <span>{user?.name}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label><RiMailLine style={{ marginRight: 4 }} />Email Address</label>
                        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user?.email}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label><RiShieldLine style={{ marginRight: 4 }} />Role</label>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label>Member Since</label>
                        <span>{joinDate}</span>
                    </div>
                </div>
            </div>

            {/* Certification Summary (User only) */}
            {user?.role !== 'admin' && (
                <div className="cert-view-card" style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RiAwardLine /> Certification Summary
                    </div>
                    <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 0 }}>
                        {[
                            { label: 'Total', value: certs.length, color: 'var(--accent-blue)' },
                            { label: 'Active', value: active, color: 'var(--accent-green)' },
                            { label: 'Expiring Soon', value: expiring, color: 'var(--accent-orange)' },
                            { label: 'Expired', value: expired, color: 'var(--accent-red)' },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '14px 16px',
                                border: '1px solid var(--border)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notifications Settings Link */}
            <div className="cert-view-card">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RiBellLine /> Notifications
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Email Notification Preferences</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Notifications: <strong style={{ color: user?.notificationsEnabled ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {user?.notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </strong>
                            {user?.notificationsEnabled && (
                                <> &nbsp;·&nbsp; Frequency: <strong style={{ color: 'var(--accent-blue)', textTransform: 'capitalize' }}>
                                    {user?.notificationFrequency}
                                </strong></>
                            )}
                        </div>
                    </div>
                    <Link to="/notifications" className="btn-secondary-custom" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Manage <RiArrowRightLine />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
