import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getDaysUntilExpiry } from '../../utils/certUtils';
import { RiCheckLine, RiNotification3Line, RiRefreshLine } from 'react-icons/ri';

const RenewalManagementPage = () => {
    const { getExpiringCerts, updateCertStatus, notifyUser } = useData();
    const [notifications, setNotifications] = useState({});
    const [approvals, setApprovals] = useState({});
    const [toast, setToast] = useState(null);
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const result = await getExpiringCerts(null);
                setCerts(result || []);
            } catch (err) {
                console.error('Failed to fetch expiring certs:', err);
                setCerts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, [getExpiringCerts]);

    if (loading) {
        return <div className="page-title">⏳ Loading...</div>;
    }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApprove = async (certId, certName) => {
        try {
            await updateCertStatus(certId);
            setApprovals(prev => ({ ...prev, [certId]: true }));
            showToast(`✓ Renewal approved for "${certName}"`);
        } catch (err) {
            console.error('Failed to approve:', err);
            showToast('Failed to approve renewal', 'error');
        }
    };

    const handleNotify = async (certId, userName) => {
        try {
            await notifyUser(certId);
            setNotifications(prev => ({ ...prev, [certId]: true }));
            showToast(`📧 Notification sent to ${userName}`);
        } catch (err) {
            console.error('Failed to notify user:', err);
            showToast('Failed to send notification', 'error');
        }
    };

    return (
        <div className="fade-up">
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: 'var(--bg-card)', border: '1px solid var(--accent-green)',
                    borderRadius: 'var(--radius-sm)', padding: '12px 20px',
                    color: 'var(--accent-green)', fontWeight: 600, fontSize: 14,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    animation: 'fadeInUp 0.3s ease',
                }}>
                    {toast.msg}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">Renewal Management</h1>
                    <p className="page-subtitle">Approve renewals and notify users about expiring certifications</p>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
                    {certs.length} requiring action
                </div>
            </div>

            {certs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🎉</div>
                    <div className="empty-state-text">No renewals needed right now</div>
                    <div className="empty-state-sub">All certifications are active and up to date</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {certs.map(cert => {
                        const certId = cert.id || cert.certId;
                        const days = getDaysUntilExpiry(cert.expiryDate);
                        const isApproved = approvals[certId] || cert.renewalStatus === 'APPROVED';
                        const isNotified = notifications[certId];

                        return (
                            <div key={certId} style={{
                                background: 'var(--bg-card)',
                                border: isApproved ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '20px 24px',
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: 20,
                                alignItems: 'center',
                                transition: 'border-color 0.3s',
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>User</div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{cert.userName}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Certification</div>
                                        <div className="cert-name-cell" style={{ fontSize: 14 }}>{cert.certName}</div>
                                        <div className="issuer-cell" style={{ fontSize: 12 }}>{cert.issuedBy}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Expiry</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(cert.expiryDate)}</div>
                                        <div style={{ fontSize: 12, color: days < 0 ? 'var(--accent-red)' : 'var(--accent-orange)', marginTop: 2, fontWeight: 600 }}>
                                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Status</div>
                                        <StatusBadge status={isApproved ? 'APPROVED' : cert.status} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
                                    <button
                                        className={isApproved ? 'btn-success-custom' : 'btn-success-custom'}
                                        onClick={() => !isApproved && handleApprove(certId, cert.certName)}
                                        disabled={isApproved}
                                        style={{ opacity: isApproved ? 0.6 : 1, cursor: isApproved ? 'default' : 'pointer' }}
                                    >
                                        <RiCheckLine style={{ display: 'inline', marginRight: 6 }} />
                                        {isApproved ? 'Approved ✓' : 'Approve Renewal'}
                                    </button>

                                    <button
                                        className="btn-secondary-custom"
                                        onClick={() => !isNotified && handleNotify(certId, cert.userName)}
                                        disabled={isNotified}
                                        style={{ opacity: isNotified ? 0.6 : 1, cursor: isNotified ? 'default' : 'pointer', justifyContent: 'center', fontSize: 13 }}
                                    >
                                        <RiNotification3Line style={{ marginRight: 6 }} />
                                        {isNotified ? 'Notified ✓' : 'Notify User'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RenewalManagementPage;
