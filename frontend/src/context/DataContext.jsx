import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import { getCertStatus } from '../utils/certUtils';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch user's certs when user logs in
    useEffect(() => {
        if (user) {
            fetchMyCerts();
        } else {
            setCerts([]);
        }
    }, [user]);

    const fetchMyCerts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/certs');
            setCerts(res.data);
        } catch (err) {
            console.error('Failed to fetch certs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMyCerts = () => certs;

    const addCertification = async (certData) => {
        const formData = new FormData();
        formData.append('certName', certData.certName);
        formData.append('issuedBy', certData.issuedBy);
        formData.append('issueDate', certData.issueDate);
        formData.append('expiryDate', certData.expiryDate);
        if (certData.file) formData.append('file', certData.file);

        const res = await api.post('/api/certs', formData);
        setCerts(prev => [...prev, res.data]);
        return res.data;
    };

    const updateCertification = async (certId, certData) => {
        const res = await api.put(`/api/certs/${certId}`, certData);
        setCerts(prev => prev.map(c => c.id === certId ? res.data : c));
        return res.data;
    };

    const deleteCertification = async (certId) => {
        await api.delete(`/api/certs/${certId}`);
        setCerts(prev => prev.filter(c => c.id !== certId));
    };

    const getCertById = async (certId) => {
        const endpoint = user?.role === 'admin'
            ? `/api/admin/certs/${certId}`
            : `/api/certs/${certId}`;
        const res = await api.get(endpoint);
        return res.data;
    };

    // Admin functions
    const getAllCerts = async () => {
        const res = await api.get('/api/admin/certs');
        return res.data;
    };

    const getExpiringCerts = async (filter) => {
        const params = filter ? `?filter=${filter}` : '';
        const res = await api.get(`/api/admin/certs/expiring${params}`);
        return res.data;
    };

    const getStats = async () => {
        const res = await api.get('/api/admin/stats');
        return res.data;
    };

    const updateCertStatus = async (certId) => {
        const res = await api.put(`/api/admin/certs/${certId}/renew`);
        return res.data;
    };

    const notifyUser = async (certId) => {
        const res = await api.post(`/api/admin/certs/${certId}/notify`);
        return res.data;
    };

    const updateReminderPreference = async (certId, disabled) => {
        const res = await api.put(`/api/certs/${certId}/reminders?disabled=${disabled}`);
        setCerts(prev => prev.map(c => (c.id === certId || c.certId === certId) ? res.data : c));
        return res.data;
    };

    const runDailyReminders = async () => {
        const res = await api.post('/api/admin/reminders/run-daily');
        return res.data;
    };

    const runWeeklyDigest = async () => {
        const res = await api.post('/api/admin/reminders/run-weekly');
        return res.data;
    };

    const getReminderJobLogs = async () => {
        const res = await api.get('/api/admin/reminders/logs');
        return res.data;
    };

    const clearReminderJobLogs = async () => {
        const res = await api.delete('/api/admin/reminders/logs');
        return res.data;
    };

    return (
        <DataContext.Provider value={{
            certs, loading,
            getMyCerts, addCertification, updateCertification,
            deleteCertification, getCertById,
            getAllCerts, getExpiringCerts, getStats,
            updateCertStatus, notifyUser, updateReminderPreference,
            runDailyReminders, runWeeklyDigest,
            getReminderJobLogs, clearReminderJobLogs,
            refreshCerts: fetchMyCerts,
        }}>
            {children}
        </DataContext.Provider>
    );
};
