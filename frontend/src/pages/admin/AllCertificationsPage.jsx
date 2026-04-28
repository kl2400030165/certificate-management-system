import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getDaysUntilExpiry } from '../../utils/certUtils';
import { Link } from 'react-router-dom';
import { RiSearchLine, RiEyeLine } from 'react-icons/ri';

const AllCertificationsPage = () => {
    const { getAllCerts } = useData();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [allCerts, setAllCerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const certs = await getAllCerts();
                setAllCerts(certs || []);
            } catch (err) {
                console.error('Failed to fetch certs:', err);
                setAllCerts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, [getAllCerts]);

    if (loading) {
        return <div className="page-title">⏳ Loading...</div>;
    }

    const filtered = allCerts.filter(c => {
        const matchSearch = c.certName.toLowerCase().includes(search.toLowerCase()) ||
            c.issuedBy.toLowerCase().includes(search.toLowerCase()) ||
            c.userName.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' ||
            (filter === 'active' && c.status === 'ACTIVE') ||
            (filter === 'expiring' && c.status === 'EXPIRING SOON') ||
            (filter === 'expired' && c.status === 'EXPIRED');
        return matchSearch && matchFilter;
    });

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Certifications</h1>
                    <p className="page-subtitle">{allCerts.length} certifications across all users</p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <RiSearchLine className="search-icon" />
                    <input placeholder="Search by cert, issuer or user..." value={search} onChange={e => setSearch(e.target.value)} />
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

            <div className="cert-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Certification</th>
                            <th>Issued By</th>
                            <th>Issue Date</th>
                            <th>Expiry Date</th>
                            <th>Days Left</th>
                            <th>Status</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                    No certifications found
                                </td>
                            </tr>
                        ) : filtered.map((cert, idx) => {
                            const certId = cert.id || cert.certId;
                            const days = getDaysUntilExpiry(cert.expiryDate);
                            return (
                                <tr key={certId}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{cert.userName}</div>
                                    </td>
                                    <td><div className="cert-name-cell">{cert.certName}</div></td>
                                    <td><div className="issuer-cell">{cert.issuedBy}</div></td>
                                    <td style={{ fontSize: 13 }}>{formatDate(cert.issueDate)}</td>
                                    <td style={{ fontSize: 13 }}>{formatDate(cert.expiryDate)}</td>
                                    <td>
                                        <span style={{ color: days < 0 ? 'var(--accent-red)' : days <= 30 ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 600, fontSize: 13 }}>
                                            {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={cert.status} /></td>
                                    <td>
                                        <Link to={`/certificate/${certId}`} className="btn-icon">
                                            <RiEyeLine />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllCertificationsPage;
