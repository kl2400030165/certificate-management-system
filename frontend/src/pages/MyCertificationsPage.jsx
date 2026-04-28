import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { formatDate, getDaysUntilExpiry } from '../utils/certUtils';
import { RiAddCircleLine, RiSearchLine, RiEyeLine, RiDownloadLine } from 'react-icons/ri';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const MyCertificationsPage = () => {
    const { getMyCerts } = useData();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const allCerts = getMyCerts();

    const filtered = allCerts.filter(c => {
        const matchFilter = filter === 'all' || c.status.toLowerCase().replace(' ', '_') === filter ||
            (filter === 'expiring' && c.status === 'EXPIRING SOON') ||
            (filter === 'expired' && c.status === 'EXPIRED') ||
            (filter === 'active' && c.status === 'ACTIVE');
        const matchSearch = c.certName.toLowerCase().includes(search.toLowerCase()) ||
            c.issuedBy.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Certifications</h1>
                    <p className="page-subtitle">{allCerts.length} total certification{allCerts.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/add-certification" className="btn-primary-custom">
                    <RiAddCircleLine /> Add New
                </Link>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <RiSearchLine className="search-icon" />
                    <input placeholder="Search certifications..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {[
                    { key: 'all', label: `All (${allCerts.length})` },
                    { key: 'active', label: `Active (${allCerts.filter(c => c.status === 'ACTIVE').length})` },
                    { key: 'expiring', label: `Expiring (${allCerts.filter(c => c.status === 'EXPIRING SOON').length})` },
                    { key: 'expired', label: `Expired (${allCerts.filter(c => c.status === 'EXPIRED').length})` },
                ].map(f => (
                    <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-text">No certifications found</div>
                    <div className="empty-state-sub">Try adjusting your filters or add a new certification</div>
                </div>
            ) : (
                <div className="cert-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Certification Name</th>
                                <th>Issued By</th>
                                <th>Issue Date</th>
                                <th>Expiry Date</th>
                                <th>Days Left</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((cert, idx) => {
                                const certId = cert.id || cert.certId;
                                const days = getDaysUntilExpiry(cert.expiryDate);
                                return (
                                    <tr key={certId}>
                                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><div className="cert-name-cell">{cert.certName}</div></td>
                                        <td><div className="issuer-cell">{cert.issuedBy}</div></td>
                                        <td>{formatDate(cert.issueDate)}</td>
                                        <td>{formatDate(cert.expiryDate)}</td>
                                        <td>
                                            <span style={{ color: days < 0 ? 'var(--accent-red)' : days <= 30 ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 600 }}>
                                                {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={cert.status} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link to={`/certificate/${certId}`} className="btn-icon" title="View">
                                                    <RiEyeLine />
                                                </Link>
                                                {cert.fileUrl && (
                                                    <a href={`${API_URL}${cert.fileUrl}`} download={cert.fileName} className="btn-icon" title="Download" target="_blank" rel="noreferrer">
                                                        <RiDownloadLine />
                                                    </a>
                                                )}
                                            </div>
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

export default MyCertificationsPage;
