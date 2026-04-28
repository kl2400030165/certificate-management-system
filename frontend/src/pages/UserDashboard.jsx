import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import CertificationRoadmap from '../components/CertificationRoadmap';
import { formatDate, getDaysUntilExpiry } from '../utils/certUtils';
import {
    RiAwardLine, RiCheckLine, RiAlarmWarningLine,
    RiCloseCircleLine, RiAddCircleLine, RiArrowRightLine, RiEyeLine
} from 'react-icons/ri';

const UserDashboard = () => {
    const { getMyCerts } = useData();
    const { user } = useAuth();
    const certs = getMyCerts();

    const total = certs.length;
    const active = certs.filter(c => c.status === 'ACTIVE').length;
    const expiring = certs.filter(c => c.status === 'EXPIRING SOON').length;
    const expired = certs.filter(c => c.status === 'EXPIRED').length;

    const recent = [...certs].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 5);

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p className="page-subtitle">Here's your certification overview</p>
                </div>
                <Link to="/add-certification" className="btn-primary-custom">
                    <RiAddCircleLine /> Add Certification
                </Link>
            </div>

            <div className="grid-stats">
                <StatsCard icon={<RiAwardLine />} value={total} label="Total Certifications" color="blue" />
                <StatsCard icon={<RiCheckLine />} value={active} label="Active" color="green" />
                <StatsCard icon={<RiAlarmWarningLine />} value={expiring} label="Expiring Soon" color="orange" />
                <StatsCard icon={<RiCloseCircleLine />} value={expired} label="Expired" color="purple" />
            </div>

            {expiring > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <span style={{ fontSize: 22, color: 'var(--accent-orange)', display: 'inline-flex' }}><RiAlarmWarningLine /></span>
                    <div>
                        <div style={{ fontWeight: 600, color: '#f59e0b' }}>Renewal Reminder</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                            You have <strong style={{ color: '#f59e0b' }}>{expiring}</strong> certification{expiring > 1 ? 's' : ''} expiring within 30 days. Take action now!
                        </div>
                    </div>
                    <Link to="/certifications" className="btn-secondary-custom" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        View All <RiArrowRightLine />
                    </Link>
                </div>
            )}

            <CertificationRoadmap />

            <div className="section-title">Recent Certifications</div>

            {recent.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><RiAwardLine /></div>
                    <div className="empty-state-text">No certifications yet</div>
                    <div className="empty-state-sub">Add your first certification to get started</div>
                    <Link to="/add-certification" className="btn-primary-custom" style={{ marginTop: 16, display: 'inline-flex' }}>
                        <RiAddCircleLine /> Add Certification
                    </Link>
                </div>
            ) : (
                <div className="cert-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Certification</th>
                                <th>Issued By</th>
                                <th>Issue Date</th>
                                <th>Expiry Date</th>
                                <th>Days Left</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map(cert => {
                                const certId = cert.id || cert.certId;
                                const days = getDaysUntilExpiry(cert.expiryDate);
                                return (
                                    <tr key={certId}>
                                        <td><div className="cert-name-cell">{cert.certName}</div></td>
                                        <td><div className="issuer-cell">{cert.issuedBy}</div></td>
                                        <td>{formatDate(cert.issueDate)}</td>
                                        <td>{formatDate(cert.expiryDate)}</td>
                                        <td>
                                            <span style={{ color: days < 0 ? 'var(--accent-red)' : days <= 30 ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 600 }}>
                                                {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={cert.status} /></td>
                                        <td>
                                            <Link to={`/certificate/${certId}`} className="btn-icon" title="View"><RiEyeLine /></Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
