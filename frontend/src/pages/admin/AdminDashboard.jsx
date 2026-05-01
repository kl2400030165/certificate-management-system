import { useData } from '../../context/DataContext';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/certUtils';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    RiGroupLine, RiAwardLine, RiAlarmWarningLine,
    RiCloseCircleLine, RiArrowRightLine, RiRefreshLine
} from 'react-icons/ri';

const AdminDashboard = () => {
    const {
        getExpiringCerts,
        getStats,
        runDailyReminders,
        runWeeklyDigest,
        getReminderJobLogs,
        clearReminderJobLogs,
    } = useData();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCerts: 0,
        expiringSoon: 0,
        expired: 0,
    });
    const [recentExpiring, setRecentExpiring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobRunning, setJobRunning] = useState('');
    const [jobMessage, setJobMessage] = useState('');
    const [jobLogs, setJobLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logs = await getReminderJobLogs();
                setJobLogs(Array.isArray(logs) ? logs : []);
            } catch (err) {
                console.error('Failed to fetch reminder logs:', err);
                setJobLogs([]);
            }
        };
        fetchLogs();
    }, [getReminderJobLogs]);

    const refreshLogs = async () => {
        try {
            const logs = await getReminderJobLogs();
            setJobLogs(Array.isArray(logs) ? logs : []);
        } catch (err) {
            console.error('Failed to refresh reminder logs:', err);
        }
    };

    const clearJobLogs = async () => {
        try {
            await clearReminderJobLogs();
            setJobLogs([]);
        } catch (err) {
            console.error('Failed to clear reminder logs:', err);
        }
    };

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const [nextStats, expiringCerts] = await Promise.all([
                    getStats(),
                    getExpiringCerts(),
                ]);
                setStats({
                    totalUsers: nextStats?.totalUsers || 0,
                    totalCerts: nextStats?.totalCerts || 0,
                    expiringSoon: nextStats?.expiringSoon || 0,
                    expired: nextStats?.expired || 0,
                });
                setRecentExpiring(Array.isArray(expiringCerts) ? expiringCerts.slice(0, 6) : []);
            } catch (err) {
                console.error('Failed to fetch admin certs:', err);
                setRecentExpiring([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, [getExpiringCerts, getStats]);

    if (loading) {
        return <div className="page-title">⏳ Loading...</div>;
    }

    const totalUsers = stats.totalUsers;
    const totalCerts = stats.totalCerts;
    const expiring = stats.expiringSoon;
    const expired = stats.expired;
    const active = Math.max(totalCerts - expiring - expired, 0);

    const handleRunDaily = async () => {
        setJobRunning('daily');
        setJobMessage('');
        try {
            const result = await runDailyReminders();
            const msg = 'Daily reminder job executed successfully.';
            setJobMessage(result?.message || msg);
            await refreshLogs();
        } catch (err) {
            console.error('Failed to run daily reminders:', err);
            const msg = 'Failed to run daily reminder job.';
            setJobMessage(msg);
            await refreshLogs();
        } finally {
            setJobRunning('');
        }
    };

    const handleRunWeekly = async () => {
        setJobRunning('weekly');
        setJobMessage('');
        try {
            const result = await runWeeklyDigest();
            const msg = 'Weekly digest job executed successfully.';
            setJobMessage(result?.message || msg);
            await refreshLogs();
        } catch (err) {
            console.error('Failed to run weekly digest:', err);
            const msg = 'Failed to run weekly digest job.';
            setJobMessage(msg);
            await refreshLogs();
        } finally {
            setJobRunning('');
        }
    };

    return (
        <div className="fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">⚡ Admin Dashboard</h1>
                    <p className="page-subtitle">System-wide certification overview</p>
                </div>
            </div>

            <div className="grid-stats">
                <StatsCard icon={<RiGroupLine />} value={totalUsers} label="Total Users" color="blue" />
                <StatsCard icon={<RiAwardLine />} value={totalCerts} label="Total Certifications" color="green" />
                <StatsCard icon={<RiAlarmWarningLine />} value={expiring} label="Expiring Soon" color="orange" />
                <StatsCard icon={<RiCloseCircleLine />} value={expired} label="Expired" color="purple" />
            </div>

            {(expiring + expired) > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(245,158,11,0.06))',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                }}>
                    <span style={{ fontSize: 24 }}>🚨</span>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-red)' }}>Action Required</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                            <strong style={{ color: '#f59e0b' }}>{expiring}</strong> certifications expiring soon &nbsp;·&nbsp;
                            <strong style={{ color: 'var(--accent-red)' }}>{expired}</strong> already expired
                        </div>
                    </div>
                    <Link to="/admin/expiring" className="btn-secondary-custom" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        View All <RiArrowRightLine />
                    </Link>
                </div>
            )}

            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <RiRefreshLine />
                    <strong>Reminder Jobs</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(Manual trigger for testing)</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        className="btn-primary-custom"
                        onClick={handleRunDaily}
                        disabled={jobRunning !== ''}
                        style={{ opacity: jobRunning && jobRunning !== 'daily' ? 0.6 : 1 }}
                    >
                        {jobRunning === 'daily' ? 'Running Daily...' : 'Run Daily Reminders'}
                    </button>
                    <button
                        className="btn-secondary-custom"
                        onClick={handleRunWeekly}
                        disabled={jobRunning !== ''}
                        style={{ opacity: jobRunning && jobRunning !== 'weekly' ? 0.6 : 1 }}
                    >
                        {jobRunning === 'weekly' ? 'Running Weekly...' : 'Run Weekly Digest'}
                    </button>
                </div>
                {jobMessage && (
                    <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                        {jobMessage}
                    </div>
                )}

                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong style={{ fontSize: 13 }}>Last 10 Runs</strong>
                        <button
                            className="btn-icon"
                            onClick={clearJobLogs}
                            title="Clear logs"
                            disabled={jobLogs.length === 0}
                            style={{ opacity: jobLogs.length === 0 ? 0.45 : 1 }}
                        >
                            🗑
                        </button>
                    </div>

                    {jobLogs.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No executions yet.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                            {jobLogs.map((log) => (
                                <div
                                    key={log.id}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: '8px 10px',
                                        background: 'var(--bg-secondary)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>{log.jobType || log.type}</span>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: (log.status || '').toUpperCase() === 'SUCCESS' ? 'var(--accent-green)' : 'var(--accent-red)',
                                        }}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.message}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Attention Needed */}
                <div>
                    <div className="section-title">⚠ Needs Attention</div>
                    <div className="cert-table-wrapper">
                        <table>
                            <thead>
                                <tr><th>User</th><th>Certification</th><th>Expiry</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {recentExpiring.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>All certifications are active ✓</td></tr>
                                ) : recentExpiring.map(c => (
                                    <tr key={c.id || c.certId}>
                                        <td style={{ fontWeight: 600, fontSize: 13 }}>{c.userName}</td>
                                        <td style={{ fontSize: 13 }}>{c.certName}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.expiryDate)}</td>
                                        <td><StatusBadge status={c.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stats Box */}
                <div>
                    <div className="section-title">📊 System Health</div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
                        {[
                            { label: 'Active Rate', value: totalCerts ? `${((active / totalCerts) * 100).toFixed(0)}%` : '0%', color: 'var(--accent-green)' },
                            { label: 'Expiring Soon', value: totalCerts ? `${((expiring / totalCerts) * 100).toFixed(0)}%` : '0%', color: 'var(--accent-orange)' },
                            { label: 'Expired', value: totalCerts ? `${((expired / totalCerts) * 100).toFixed(0)}%` : '0%', color: 'var(--accent-red)' },
                        ].map(stat => (
                            <div key={stat.label} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                                    <span style={{ color: stat.color, fontWeight: 700 }}>{stat.value}</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                                    <div style={{ width: stat.value, height: '100%', background: stat.color, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                            <Link to="/admin/certifications" className="btn-primary-custom" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                                All Certs
                            </Link>
                            <Link to="/admin/renewals" className="btn-secondary-custom" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                                Renewals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
