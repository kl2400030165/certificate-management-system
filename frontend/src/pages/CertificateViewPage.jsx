import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatDate, getDaysUntilExpiry } from '../utils/certUtils';
import { RiArrowLeftLine, RiDownloadLine, RiAwardLine, RiCalendarLine, RiBuildingLine, RiDeleteBinLine, RiEditLine } from 'react-icons/ri';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CertificateViewPage = () => {
    const { id } = useParams();
    const { getCertById, deleteCertification } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getCertById(id);
                setCert(data);
            } catch (err) {
                setError('Certificate not found or access denied.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (user?.role === 'admin') return;
        if (!window.confirm('Are you sure you want to delete this certification?')) return;
        setDeleting(true);
        try {
            await deleteCertification(cert.id);
            navigate('/certifications');
        } catch (err) {
            alert('Failed to delete certification.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="empty-state fade-up">
                <div className="empty-state-icon">⏳</div>
                <div className="empty-state-text">Loading certificate...</div>
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="empty-state fade-up">
                <div className="empty-state-icon">❌</div>
                <div className="empty-state-text">{error || 'Certificate not found'}</div>
                <button
                    className="btn-primary-custom"
                    onClick={() => navigate(user?.role === 'admin' ? '/admin/certifications' : '/certifications')}
                    style={{ marginTop: 16 }}
                >
                    <RiArrowLeftLine /> {user?.role === 'admin' ? 'Back to All Certifications' : 'Back to My Certifications'}
                </button>
            </div>
        );
    }

    const days = getDaysUntilExpiry(cert.expiryDate);

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Certificate Details</h1>
                    <p className="page-subtitle">View and manage your certificate</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary-custom" onClick={() => navigate(-1)}>
                        <RiArrowLeftLine /> Back
                    </button>
                    {user?.role !== 'admin' && (
                        <button
                            className="btn-icon"
                            title="Delete"
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ color: 'var(--accent-red)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            <RiDeleteBinLine /> {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    )}
                </div>
            </div>

            <div className="cert-view-card">
                <div className="cert-view-header">
                    <div className="cert-view-icon"><RiAwardLine /></div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{cert.certName}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <StatusBadge status={cert.status} />
                            {days >= 0 ? (
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {days === 0 ? '⚠ Expires today!' : `${days} days remaining`}
                                </span>
                            ) : (
                                <span style={{ fontSize: 13, color: 'var(--accent-red)' }}>
                                    Expired {Math.abs(days)} days ago
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="cert-details-grid">
                    <div className="cert-detail-item">
                        <label><RiBuildingLine style={{ marginRight: 4 }} /> Issuing Organization</label>
                        <span>{cert.issuedBy}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label>Certificate ID</label>
                        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>#{cert.id?.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label><RiCalendarLine style={{ marginRight: 4 }} /> Issue Date</label>
                        <span>{formatDate(cert.issueDate)}</span>
                    </div>
                    <div className="cert-detail-item">
                        <label><RiCalendarLine style={{ marginRight: 4 }} /> Expiry Date</label>
                        <span style={{ color: cert.status === 'EXPIRED' ? 'var(--accent-red)' : cert.status === 'EXPIRING SOON' ? 'var(--accent-orange)' : 'var(--text-primary)' }}>
                            {formatDate(cert.expiryDate)}
                        </span>
                    </div>
                    {cert.renewalStatus && cert.renewalStatus !== 'NONE' && (
                        <div className="cert-detail-item">
                            <label>Renewal Status</label>
                            <span style={{
                                color: cert.renewalStatus === 'APPROVED' ? 'var(--accent-green)' :
                                    cert.renewalStatus === 'REJECTED' ? 'var(--accent-red)' : 'var(--accent-orange)',
                                fontWeight: 600
                            }}>
                                {cert.renewalStatus}
                            </span>
                        </div>
                    )}
                    {cert.notifiedAt && (
                        <div className="cert-detail-item">
                            <label>Last Notified</label>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(cert.notifiedAt)}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {days >= 0 && (() => {
                    const total = Math.ceil((new Date(cert.expiryDate) - new Date(cert.issueDate)) / (1000 * 60 * 60 * 24));
                    const pct = Math.max(0, Math.min(100, (days / total) * 100));
                    const color = pct > 30 ? 'var(--accent-green)' : pct > 10 ? 'var(--accent-orange)' : 'var(--accent-red)';
                    return (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                                <span>Validity remaining</span><span>{pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                            </div>
                        </div>
                    );
                })()}

                {/* File Preview / Download */}
                {cert.fileUrl ? (
                    <div className="file-preview-box">
                        <div style={{ fontSize: 32, marginBottom: 10 }}>
                            {cert.fileName?.endsWith('.pdf') ? '📄' : '🖼'}
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{cert.fileName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Certificate file attached</div>

                        {cert.fileName && !cert.fileName.endsWith('.pdf') && (
                            <img
                                src={`${API_URL}${cert.fileUrl}`}
                                alt="Certificate"
                                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}
                            />
                        )}

                        <a
                            href={`${API_URL}${cert.fileUrl}`}
                            download={cert.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary-custom"
                            style={{ display: 'inline-flex' }}
                        >
                            <RiDownloadLine /> Download Certificate
                        </a>
                    </div>
                ) : (
                    <div className="file-preview-box">
                        <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📎</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No file uploaded for this certification</div>
                        <Link to="/add-certification" className="btn-secondary-custom" style={{ marginTop: 14, display: 'inline-flex' }}>
                            Upload Certificate File
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateViewPage;
