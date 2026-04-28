import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getDaysUntilExpiry } from '../../utils/certUtils';
import { RiAlarmWarningLine, RiCloseCircleLine } from 'react-icons/ri';

const ExpiringCertificationsPage = () => {
    const { getExpiringCerts } = useData();
    const [filter, setFilter] = useState('all');
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const result = await getExpiringCerts(filter === 'all' ? null : filter);
                setCerts(result || []);
            } catch (err) {
                console.error('Failed to fetch expiring certs:', err);
                setCerts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, [getExpiringCerts, filter]);

    if (loading) {
        return <div className="page-title">⏳ Loading...</div>;
    }

    // Calculate counts for summary boxes
    const expiring30Count = certs.filter(c => getDaysUntilExpiry(c.expiryDate) <= 30 && getDaysUntilExpiry(c.expiryDate) > 0).length;
    const expiredCount = certs.filter(c => getDaysUntilExpiry(c.expiryDate) <= 0).length;

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Expiring Certifications</h1>
                    <p className="page-subtitle">Track and manage certifications that need renewal</p>
                </div>
            </div>

            {/* Summary boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Expiring in 30 Days', count: expiring30Count, color: '#f59e0b', icon: <RiAlarmWarningLine />, key: '30days' },
                    { label: 'Already Expired', count: expiredCount, color: '#ef4444', icon: <RiCloseCircleLine />, key: 'expired' },
                ].map(s => (
                    <div key={s.key} onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                        style={{
                            background: `rgba(${s.color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.08)`,
                            border: `1px solid ${s.color}44`,
                            borderRadius: 'var(--radius-md)',
                            padding: '20px 22px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: filter === s.key ? `2px solid ${s.color}` : 'none',
                        }}
                    >
                        <div style={{ color: s.color, fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="filter-bar">
                {[
                    { key: 'all', label: 'All Non-Active' },
                    { key: '30days', label: '⚠ Expiring in 30 Days' },
                    { key: 'expired', label: '✕ Expired' },
                ].map(f => (
                    <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
            </div>

            <div className="cert-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Certification</th>
                            <th>Issued By</th>
                            <th>Expiry Date</th>
                            <th>Days Overdue / Left</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certs.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                                    <div style={{ fontWeight: 600 }}>No certifications in this category</div>
                                </td>
                            </tr>
                        ) : certs.map((cert, idx) => {
                            const certId = cert.id || cert.certId;
                            const days = getDaysUntilExpiry(cert.expiryDate);
                            return (
                                <tr key={certId}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>{cert.userName}</td>
                                    <td><div className="cert-name-cell">{cert.certName}</div></td>
                                    <td><div className="issuer-cell">{cert.issuedBy}</div></td>
                                    <td style={{ fontSize: 13 }}>{formatDate(cert.expiryDate)}</td>
                                    <td>
                                        <span style={{ color: days < 0 ? 'var(--accent-red)' : 'var(--accent-orange)', fontWeight: 700 }}>
                                            {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={cert.status} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpiringCertificationsPage;
