import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateCertificationRoadmap } from '../utils/roadmapUtils';
import '../styles/CertificationRoadmap.css';

const getUserRole = (user) => {
    if (!user) return 'General Learner';

    return (
        user.careerRole ||
        user.jobRole ||
        user.profession ||
        user.title ||
        'General Learner'
    );
};

const renderCertificationItems = (items, emptyLabel) => {
    if (!items.length) {
        return <div className="roadmap-empty-inline">{emptyLabel}</div>;
    }

    return (
        <ol className="roadmap-list">
            {items.map((certification, index) => (
                <li key={`${certification}-${index}`} className="roadmap-list-item">
                    <span className="roadmap-step">{index + 1}</span>
                    <span>{certification}</span>
                </li>
            ))}
        </ol>
    );
};

const CertificationRoadmap = () => {
    const { getMyCerts } = useData();
    const { user } = useAuth();
    const certifications = getMyCerts();
    const userRole = getUserRole(user);

    const roadmap = useMemo(
        () => generateCertificationRoadmap(certifications, userRole),
        [certifications, userRole]
    );

    return (
        <section className="roadmap-card fade-up" aria-label="Certification roadmap generator">
            <div className="roadmap-header">
                <div>
                    <h2>Certification Roadmap Generator</h2>
                    <p>
                        Certificate-based recommendations with progression insights and career guidance.
                    </p>
                </div>
                <span className="roadmap-role-pill">Role: {roadmap.role}</span>
            </div>

            <div className="roadmap-completed">
                <strong>Current Certifications:</strong>
                {roadmap.completedCertifications.length ? (
                    <div className="roadmap-chip-group">
                        {roadmap.completedCertifications.map((certification, index) => (
                            <span key={`${certification}-${index}`} className="roadmap-chip">
                                {certification}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="roadmap-empty-inline">No certifications found yet.</div>
                )}
            </div>

            <div className="roadmap-grid">
                <div className="roadmap-section">
                    <h3>Recommended Next Certifications</h3>
                    {renderCertificationItems(
                        roadmap.recommendedNextCertifications,
                        roadmap.completedCertifications.length
                            ? 'No additional recommendations found for your current certification profile.'
                            : 'Add at least one certification to generate your next recommendations.'
                    )}
                </div>

                <div className="roadmap-section">
                    <h3>Advanced Certification Path</h3>
                    {renderCertificationItems(
                        roadmap.advancedCertificationPath,
                        roadmap.completedCertifications.length
                            ? 'No advanced recommendations at this stage.'
                            : 'Advanced path will appear after certificate-based matching starts.'
                    )}
                </div>

                <div className="roadmap-section">
                    <h3>Optional Certifications</h3>
                    {renderCertificationItems(
                        roadmap.optionalCertifications,
                        roadmap.completedCertifications.length
                            ? 'No optional recommendations right now.'
                            : 'Optional suggestions will appear based on your completed certificates.'
                    )}
                </div>
            </div>

            {!!roadmap.roleFallbackHint.length && !roadmap.completedCertifications.length && (
                <div className="roadmap-hint">
                    <strong>Role Hint:</strong> Based on role, you may start with{' '}
                    {roadmap.roleFallbackHint.join(' • ')}.
                </div>
            )}

            <div className="roadmap-advice">
                <h3>Career Advice Based on Your Certifications</h3>
                {roadmap.careerAdvice.length ? (
                    <ul className="roadmap-advice-list">
                        {roadmap.careerAdvice.map((advice, index) => (
                            <li key={`${advice}-${index}`}>{advice}</li>
                        ))}
                    </ul>
                ) : (
                    <div className="roadmap-empty-inline">
                        Add certifications to unlock personalized career advice.
                    </div>
                )}
            </div>

            <div className="roadmap-timeline">
                <h3>Estimated Learning Progression</h3>
                {roadmap.estimatedLearningProgression.length ? (
                    <div className="roadmap-timeline-flow">
                        {roadmap.estimatedLearningProgression.map((stage, index) => (
                            <div key={`${stage.phase}-${index}`} className="roadmap-stage">
                                <div className="roadmap-stage-title-row">
                                    <span className="roadmap-stage-index">Phase {index + 1}</span>
                                    <span className="roadmap-stage-duration">{stage.duration}</span>
                                </div>
                                <div className="roadmap-stage-title">{stage.phase}</div>
                                <div className="roadmap-stage-targets">
                                    {stage.targetCertifications.join(' • ')}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="roadmap-empty-inline">
                        Estimated progression will be generated once certifications are available.
                    </div>
                )}
            </div>
        </section>
    );
};

export default CertificationRoadmap;
