import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { CERT_DB, DOMAINS, generateSmartRoadmap } from '../utils/roadmapData';
import {
    RiRoadMapLine, RiCheckboxCircleFill, RiTimeLine,
    RiAwardLine, RiArrowRightLine, RiLightbulbLine,
    RiBriefcaseLine, RiMoneyDollarCircleLine, RiBarChartLine,
    RiAddCircleLine, RiInformationLine, RiArrowUpLine,
    RiStarLine, RiShieldCheckLine,
} from 'react-icons/ri';
import '../styles/CareerImpactPage.css';

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
const LEVEL_LABELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' };
const LEVEL_COLORS = {
    1: '#10b981',
    2: '#0ea5e9',
    3: '#f59e0b',
    4: '#f43f5e',
};

/** Fuzzy-match a user cert name against the CERT_DB */
function matchCertToDB(certName = '') {
    const q = certName.trim().toLowerCase();
    if (!q) return null;
    // Exact id match
    const direct = Object.values(CERT_DB).find(c => c.id === q);
    if (direct) return direct;
    // Name includes
    return (
        Object.values(CERT_DB).find(c => c.name.toLowerCase().includes(q)) ||
        Object.values(CERT_DB).find(c => q.includes(c.name.toLowerCase().split(' ').slice(0, 2).join(' '))) ||
        null
    );
}

/** Map cert status → colour */
function statusColor(status = '') {
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return '#10b981';
    if (s.includes('EXPIRING')) return '#f59e0b';
    if (s === 'EXPIRED') return '#ef4444';
    return '#94a3b8';
}

/** Overall portfolio score out of 100 */
function portfolioScore(matched) {
    if (!matched.length) return 0;
    const levelSum = matched.reduce((s, m) => s + m.level, 0);
    const avg = levelSum / matched.length;
    const diversity = new Set(matched.map(m => m.domain)).size;
    // weighted: avg level (0-40) + count bonus (0-40) + diversity (0-20)
    const levelScore = ((avg - 1) / 3) * 40;
    const countScore = Math.min(matched.length / 5, 1) * 40;
    const divScore = (diversity / 6) * 20;
    return Math.round(levelScore + countScore + divScore);
}

/* ─────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────── */
function ScoreMeter({ score }) {
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#0ea5e9';
    const label = score >= 70 ? 'Strong Portfolio' : score >= 40 ? 'Growing Profile' : score > 0 ? 'Getting Started' : 'No Certs Yet';
    return (
        <div className="score-meter">
            <div className="score-meter__ring" style={{ '--score': score, '--color': color }}>
                <svg viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" className="score-meter__track" />
                    <circle
                        cx="40" cy="40" r="34"
                        className="score-meter__fill"
                        style={{
                            stroke: color,
                            strokeDasharray: `${(score / 100) * 213.6} 213.6`,
                        }}
                    />
                </svg>
                <div className="score-meter__label">
                    <div className="score-meter__value">{score}</div>
                    <div className="score-meter__unit">/ 100</div>
                </div>
            </div>
            <div className="score-meter__text" style={{ color }}>{label}</div>
        </div>
    );
}

function DomainTag({ domainId }) {
    const d = DOMAINS.find(x => x.id === domainId);
    if (!d) return null;
    return (
        <span className="domain-tag" style={{ '--dc': d.color }}>
            {d.icon} {d.label}
        </span>
    );
}

/** Card for a cert that WAS matched in the DB */
function MatchedCertCard({ userCert, dbCert }) {
    const [expanded, setExpanded] = useState(false);
    const daysLeft = userCert.daysLeft ?? 999;
    const certStatus = userCert.status || 'ACTIVE';

    return (
        <div className={`impact-card ${expanded ? 'impact-card--expanded' : ''}`} id={`impact-card-${dbCert.id}`}>
            {/* Header */}
            <div className="impact-card__header">
                <div className="impact-card__cert-icon">🎓</div>
                <div className="impact-card__cert-info">
                    <div className="impact-card__cert-name">{userCert.certName || dbCert.name}</div>
                    <div className="impact-card__cert-issuer">{dbCert.issuer} · {dbCert.examCode}</div>
                    <div className="impact-card__cert-meta">
                        <DomainTag domainId={dbCert.domain} />
                        <span
                            className="impact-card__status"
                            style={{ color: statusColor(certStatus) }}
                        >
                            ● {certStatus}
                        </span>
                        {daysLeft > 0 && daysLeft < 999 && (
                            <span className="impact-card__days">{daysLeft}d left</span>
                        )}
                    </div>
                </div>
                <div className="impact-card__level-badge" style={{ borderColor: LEVEL_COLORS[dbCert.level], color: LEVEL_COLORS[dbCert.level] }}>
                    {LEVEL_LABELS[dbCert.level]}
                </div>
            </div>

            {/* Career Impact Summary */}
            <div className="impact-card__summary">
                <div className="impact-card__summary-item">
                    <RiMoneyDollarCircleLine />
                    <div>
                        <div className="impact-card__summary-label">Salary Range</div>
                        <div className="impact-card__summary-value">{dbCert.avgSalary}</div>
                    </div>
                </div>
                <div className="impact-card__summary-item">
                    <RiBriefcaseLine />
                    <div>
                        <div className="impact-card__summary-label">Career Roles</div>
                        <div className="impact-card__summary-value">{dbCert.jobRoles.slice(0, 2).join(', ')}</div>
                    </div>
                </div>
                <div className="impact-card__summary-item">
                    <RiBarChartLine />
                    <div>
                        <div className="impact-card__summary-label">Unlocks Next</div>
                        <div className="impact-card__summary-value">
                            {dbCert.next.length
                                ? dbCert.next.slice(0, 2).map(id => CERT_DB[id]?.name || id).join(', ')
                                : 'Advanced level reached'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Career outcome */}
            <div className="impact-card__outcome">
                <RiStarLine />
                <span>{dbCert.careerOutcome}</span>
            </div>

            {/* Expand button */}
            <button
                className="impact-card__expand-btn"
                onClick={() => setExpanded(e => !e)}
            >
                {expanded ? 'Show less ▲' : 'Show full impact ▼'}
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="impact-card__detail fade-up">
                    <div className="impact-detail-section">
                        <div className="impact-detail-section__title">🛠 Skills This Cert Validates</div>
                        <div className="impact-detail-chips">
                            {dbCert.skills.map(s => (
                                <span key={s} className="impact-chip">{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="impact-detail-section">
                        <div className="impact-detail-section__title">💼 Job Roles You Qualify For</div>
                        <div className="impact-detail-chips">
                            {dbCert.jobRoles.map(r => (
                                <span key={r} className="impact-chip impact-chip--role">{r}</span>
                            ))}
                        </div>
                    </div>

                    {dbCert.next.length > 0 && (
                        <div className="impact-detail-section">
                            <div className="impact-detail-section__title">
                                <RiArrowUpLine /> Recommended Next Certifications
                            </div>
                            <div className="impact-next-certs">
                                {dbCert.next.map(id => {
                                    const next = CERT_DB[id];
                                    if (!next) return null;
                                    return (
                                        <div key={id} className="impact-next-cert">
                                            <div className="impact-next-cert__name">{next.name}</div>
                                            <div className="impact-next-cert__meta">
                                                <span style={{ color: LEVEL_COLORS[next.level] }}>{LEVEL_LABELS[next.level]}</span>
                                                <span>· {next.durationMonths}mo · {next.cost}</span>
                                            </div>
                                            <div className="impact-next-cert__outcome">{next.avgSalary}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {dbCert.advanced.length > 0 && (
                        <div className="impact-detail-section">
                            <div className="impact-detail-section__title">🚀 Advanced Path</div>
                            <div className="impact-detail-chips">
                                {dbCert.advanced.map(id => (
                                    <span key={id} className="impact-chip impact-chip--adv">
                                        {CERT_DB[id]?.name || id}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/** Card for a cert that was NOT matched in DB */
function UnmatchedCertCard({ userCert }) {
    return (
        <div className="impact-card impact-card--unmatched" id={`impact-card-unmatched-${userCert.id}`}>
            <div className="impact-card__header">
                <div className="impact-card__cert-icon" style={{ opacity: 0.5 }}>📄</div>
                <div className="impact-card__cert-info">
                    <div className="impact-card__cert-name">{userCert.certName}</div>
                    <div className="impact-card__cert-issuer">{userCert.issuedBy}</div>
                    <div className="impact-card__cert-meta">
                        <span className="impact-card__status" style={{ color: statusColor(userCert.status) }}>
                            ● {userCert.status}
                        </span>
                    </div>
                </div>
            </div>
            <div className="impact-card__unmatched-note">
                <RiInformationLine />
                <span>
                    This certification isn't in our database yet — detailed career impact isn't available,
                    but the cert is tracked and counted in your portfolio score.
                </span>
            </div>
        </div>
    );
}

/** "What to do next" section */
function NextStepsSection({ ownedIds }) {
    const { recommended, skillGaps } = useMemo(
        () => generateSmartRoadmap(ownedIds),
        [ownedIds]
    );

    if (!ownedIds.length) return null;

    return (
        <div className="next-steps-section">
            <div className="next-steps-section__title">
                <RiArrowUpLine /> What to Pursue Next
                <span className="next-steps-section__subtitle">
                    Certifications that directly build on what you already have
                </span>
            </div>

            {recommended.length > 0 ? (
                <div className="next-steps-grid">
                    {recommended.map(c => (
                        <div key={c.id} className="next-step-card">
                            <div className="next-step-card__header">
                                <span className="next-step-card__icon">
                                    {DOMAINS.find(d => d.id === c.domain)?.icon || '🎓'}
                                </span>
                                <div className="next-step-card__level" style={{ color: LEVEL_COLORS[c.level] }}>
                                    {LEVEL_LABELS[c.level]}
                                </div>
                            </div>
                            <div className="next-step-card__name">{c.name}</div>
                            <div className="next-step-card__issuer">{c.issuer}</div>
                            <div className="next-step-card__meta">
                                <span><RiTimeLine /> {c.durationMonths}mo</span>
                                <span><RiMoneyDollarCircleLine /> {c.cost}</span>
                            </div>
                            <div className="next-step-card__salary">{c.avgSalary}</div>
                            <div className="next-step-card__outcome">{c.careerOutcome.slice(0, 80)}…</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="next-steps-empty">
                    You've completed all directly-unlocked paths! Browse the full roadmap for advanced specialisations.
                </p>
            )}

            {skillGaps.length > 0 && (
                <div className="skill-gap-row">
                    <div className="skill-gap-row__title">⚡ Skills You're Missing</div>
                    <div className="skill-gap-row__items">
                        {skillGaps.map(c => (
                            <div key={c.id} className="skill-gap-pill">
                                <span>{DOMAINS.find(d => d.id === c.domain)?.icon} {c.name}</span>
                                <span className="skill-gap-pill__salary">{c.avgSalary}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
const CareerImpactPage = () => {
    const { getMyCerts } = useData();
    const certs = getMyCerts();

    // Match each uploaded cert to DB
    const analyzed = useMemo(() => certs.map(cert => ({
        userCert: cert,
        dbCert: matchCertToDB(cert.certName),
    })), [certs]);

    const matched = analyzed.filter(a => a.dbCert);
    const unmatched = analyzed.filter(a => !a.dbCert);
    const ownedIds = matched.map(m => m.dbCert.id);
    const score = portfolioScore(matched.map(m => m.dbCert));

    // Derived stats
    const domains = new Set(matched.map(m => m.dbCert.domain));
    const topDomain = DOMAINS.find(d => d.id === [...domains][0]);

    return (
        <div className="career-impact-page fade-up">
            {/* Page header */}
            <div className="ci-page-header">
                <div>
                    <h1 className="page-title">
                        <RiShieldCheckLine style={{ verticalAlign: 'middle', marginRight: 10, color: 'var(--accent-primary)' }} />
                        Career Impact Analyser
                    </h1>
                    <p className="page-subtitle">
                        See how your certifications shape your career, salary potential, and skill profile
                    </p>
                </div>
                <Link to="/add-certification" className="btn-primary-custom" id="ci-add-cert-btn">
                    <RiAddCircleLine /> Add Certification
                </Link>
            </div>

            {certs.length === 0 ? (
                /* Empty state */
                <div className="ci-empty">
                    <div className="ci-empty__icon">🎓</div>
                    <div className="ci-empty__title">No certifications uploaded yet</div>
                    <p className="ci-empty__sub">
                        Upload your first certificate to see how it impacts your career — job roles, salary ranges, skills validated, and your personalised progression path.
                    </p>
                    <Link to="/add-certification" className="btn-primary-custom" style={{ marginTop: 20 }}>
                        <RiAddCircleLine /> Upload Your First Certificate
                    </Link>
                </div>
            ) : (
                <>
                    {/* Portfolio overview */}
                    <div className="ci-overview">
                        <ScoreMeter score={score} />

                        <div className="ci-overview__stats">
                            <div className="ci-stat">
                                <div className="ci-stat__val">{certs.length}</div>
                                <div className="ci-stat__label">Certificates Uploaded</div>
                            </div>
                            <div className="ci-stat">
                                <div className="ci-stat__val">{matched.length}</div>
                                <div className="ci-stat__label">Career-Analysed</div>
                            </div>
                            <div className="ci-stat">
                                <div className="ci-stat__val">{domains.size}</div>
                                <div className="ci-stat__label">Domain{domains.size !== 1 ? 's' : ''} Covered</div>
                            </div>
                            <div className="ci-stat">
                                <div className="ci-stat__val">
                                    {matched.length
                                        ? Math.max(...matched.map(m => m.dbCert.level))
                                        : '—'}
                                </div>
                                <div className="ci-stat__label">Highest Level</div>
                            </div>
                        </div>

                        <div className="ci-overview__insight">
                            <RiLightbulbLine />
                            <div>
                                <strong>Portfolio Insight</strong><br />
                                {score === 0 && 'Upload recognised certifications to get your career impact score.'}
                                {score > 0 && score < 30 && `You're just getting started. ${certs.length === 1 ? 'One certification' : `${certs.length} certs`} on record — keep building!`}
                                {score >= 30 && score < 60 && `Solid foundation across ${domains.size} domain(s). Pursue intermediate or advanced certs to raise your salary ceiling.`}
                                {score >= 60 && score < 80 && `Strong, multi-domain profile. Focus on specialisation to break into senior roles.`}
                                {score >= 80 && `Expert-level portfolio. You qualify for architect, lead, and director roles in your domains.`}
                            </div>
                        </div>
                    </div>

                    {/* Per-cert impact cards */}
                    <div className="ci-section-title">
                        <RiAwardLine /> Your Certificates & Career Value
                    </div>

                    <div className="impact-cards-list">
                        {analyzed.map(({ userCert, dbCert }) =>
                            dbCert
                                ? <MatchedCertCard key={userCert.id} userCert={userCert} dbCert={dbCert} />
                                : <UnmatchedCertCard key={userCert.id} userCert={userCert} />
                        )}
                    </div>

                    {/* What to do next */}
                    <NextStepsSection ownedIds={ownedIds} />

                    {/* Browse full roadmap CTA */}
                    <div className="ci-explore-cta">
                        <div>
                            <div className="ci-explore-cta__title"><RiRoadMapLine /> Want to explore more paths?</div>
                            <div className="ci-explore-cta__sub">Browse 30+ certifications across 6 domains with full prerequisite maps and salary data.</div>
                        </div>
                        <Link to="/roadmap" className="btn-secondary-custom" id="ci-explore-roadmap-btn">
                            Open Full Roadmap <RiArrowRightLine />
                        </Link>
                    </div>

                    {/* Unmatched note */}
                    {unmatched.length > 0 && (
                        <div className="ci-unmatched-note">
                            <RiInformationLine />
                            <span>
                                <strong>{unmatched.length}</strong> of your certificate(s) couldn't be matched to our database for detailed analysis. They still count toward your portfolio.
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CareerImpactPage;
