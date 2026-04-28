import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { RiUploadCloud2Line, RiCheckLine } from 'react-icons/ri';

const AddCertificationPage = () => {
    const [form, setForm] = useState({
        certName: '', issuedBy: '', issueDate: '', expiryDate: '',
    });
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();
    const { addCertification } = useData();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFile = (f) => {
        if (f && f.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return; }
        setFile(f);
        setError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (new Date(form.expiryDate) <= new Date(form.issueDate)) {
            setError('Expiry date must be after issue date');
            return;
        }
        setLoading(true);

        const saveAndRedirect = async () => {
            await addCertification({ ...form, file });
            setSuccess(true);
            setTimeout(() => navigate('/certifications'), 1500);
        };

        try {
            await saveAndRedirect();
        } catch (err) {
            const apiError = err.response?.data;
            const fallback = 'Failed to save certification';
            const message = typeof apiError === 'string'
                ? apiError
                : apiError?.message || apiError?.error || fallback;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#10b981,#06b6d4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(16,185,129,0.4)' }}>✓</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Certification Added!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your certifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add Certification</h1>
                    <p className="page-subtitle">Record a new professional certification</p>
                </div>
            </div>

            <div className="form-wrapper">
                {error && <div className="auth-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Certification Name *</label>
                        <input className="form-input" name="certName" placeholder="e.g. AWS Solutions Architect"
                            value={form.certName} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Issuing Organization *</label>
                        <input className="form-input" name="issuedBy" placeholder="e.g. Amazon Web Services"
                            value={form.issuedBy} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Issue Date *</label>
                            <input className="form-input" name="issueDate" type="date"
                                value={form.issueDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expiry Date *</label>
                            <input className="form-input" name="expiryDate" type="date"
                                value={form.expiryDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Certificate (optional)</label>
                        <div
                            className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current.click()}
                        >
                            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden
                                onChange={e => handleFile(e.target.files[0])} />
                            <div className="file-upload-icon"><RiUploadCloud2Line /></div>
                            {file ? (
                                <div>
                                    <div style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: 14 }}>
                                        <RiCheckLine style={{ display: 'inline' }} /> {file.name}
                                    </div>
                                    <div className="file-upload-hint">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="file-upload-text">Drag & drop or click to upload</div>
                                    <div className="file-upload-hint">PDF, JPG, PNG — Max 5MB</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="submit" className="btn-primary-custom" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: 13 }}>
                            {loading ? '⏳ Saving...' : '✅ Save Certification'}
                        </button>
                        <button type="button" className="btn-secondary-custom" onClick={() => navigate('/certifications')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCertificationPage;
