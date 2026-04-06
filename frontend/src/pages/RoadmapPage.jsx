import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    DOMAINS, CERT_DB, buildDomainGraph, generateSmartRoadmap
} from '../utils/roadmapData';
import {
    RiRoadMapLine, RiCheckboxCircleFill, RiTimeLine,
    RiMedalLine, RiArrowRightLine, RiLockLine,
    RiLightbulbLine, RiBarChartLine, RiSearchLine,
    RiInformationLine, RiBriefcaseLine, RiMoneyDollarCircleLine,
    RiAwardLine,
} from 'react-icons/ri';
import '../styles/RoadmapPage.css';

/* ── helpers ────────────────────────────────────────────── */
const LEVEL_LABELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' };
const LEVEL_COLORS = {
    1: 'var(--accent-emerald)',
    2: 'var(--accent-primary)',
    3: 'var(--accent-amber)',
    4: 'var(--accent-rose)',
};

function matchOwnedCerts(certs) {
    const db = Object.values(CERT_DB);
    return certs.map(cert => {
        const name = (cert?.certName || '').toLowerCase();
        const match = db.find(d =>
            d.name.toLowerCase().includes(name) || name.includes(d.name.toLowerCase())
        );
        return match?.id ?? null;
    }).filter(Boolean);
}

/* ── sub-components ─────────────────────────────────────── */
function DomainCard({ domain, active, onClick }) {
    return (
        <button
            className={`domain-card ${active ? 'domain-card--active' : ''}`}
            style={{ '--domain-color': domain.color, '--domain-gradient': domain.gradient }}
            onClick={onClick}
            id={`domain-btn-${domain.id}`}
        >
            <span className="domain-card__icon">{domain.icon}</span>
            <span className="domain-card__label">{domain.label}</span>
            {active && <span className="domain-card__active-dot" />}
        </button>
    );
}

function LevelBadge({ level }) {
    return (
        <span className="cert-node__level-badge" style={{ color: LEVEL_COLORS[level] }}>
            {LEVEL_LABELS[level]}
        </span>
    );
}

function CertNode({ cert, onClick, selected }) {
    const stateClass = cert.owned
        ? 'cert-node--owned'
        : cert.unlocked
        ? 'cert-node--unlocked'
        : 'cert-node--locked';

    return (
        <button
            className={`cert-node ${stateClass} ${selected ? 'cert-node--selected' : ''}`}
            onClick={() => onClick(cert)}
            title={cert.name}
            id={`cert-node-${cert.id}`}
        >
            <div className="cert-node__status-icon">
                {cert.owned
                    ? <RiCheckboxCircleFill />
                    : cert.unlocked
                    ? <RiAwardLine />
                    : <RiLockLine />}
            </div>
            <div className="cert-node__name">{cert.name}</div>
            <div className="cert-node__issuer">{cert.issuer}</div>
            <LevelBadge level={cert.level} />
            <div className="cert-node__duration">
                <RiTimeLine /> {cert.durationMonths}mo
            </div>
        </button>
    );
}

function CertDetailPanel({ cert, onClose }) {
    if (!cert) return null;
    const full = CERT_DB[cert.id] || cert;
    return (
        <div className="cert-detail-panel fade-up" id="cert-detail-panel">
            <div className="cert-detail-panel__header">
                <div>
                    <div className="cert-detail-panel__name">{full.name}</div>
                    <div className="cert-detail-panel__issuer">{full.issuer} · {full.examCode}</div>
                </div>
                <button className="cert-detail-panel__close" onClick={onClose}>✕</button>
            </div>

            {/* Owned / unlocked indicator */}
            {cert.owned && (
                <div className="cert-detail-panel__owned-badge">
                    <RiCheckboxCircleFill /> You already have this certification!
                </div>
            )}

            <div className="cert-detail-panel__grid">
                <div className="cdp-stat">
                    <span className="cdp-stat__label"><RiTimeLine /> Duration</span>
                    <span className="cdp-stat__val">{full.durationMonths} months</span>
                </div>
                <div className="cdp-stat">
                    <span className="cdp-stat__label"><RiMoneyDollarCircleLine /> Exam Cost</span>
                    <span className="cdp-stat__val">{full.cost}</span>
                </div>
                <div className="cdp-stat">
                    <span className="cdp-stat__label"><RiBarChartLine /> Difficulty</span>
                    <span className="cdp-stat__val" style={{ color: LEVEL_COLORS[full.level] }}>
                        {LEVEL_LABELS[full.level]}
                    </span>
                </div>
                <div className="cdp-stat">
                    <span className="cdp-stat__label"><RiMedalLine /> Avg Salary</span>
                    <span className="cdp-stat__val">{full.avgSalary}</span>
                </div>
            </div>

            <div className="cdp-section">
                <div className="cdp-section__title"><RiLightbulbLine /> Skills You'll Gain</div>
                <div className="cdp-chips">
                    {(full.skills || []).map(s => (
                        <span key={s} className="cdp-chip">{s}</span>
                    ))}
                </div>
            </div>

            <div className="cdp-section">
                <div className="cdp-section__title"><RiBriefcaseLine /> Career Outcome</div>
                <p className="cdp-text">{full.careerOutcome}</p>
            </div>

            <div className="cdp-section">
                <div className="cdp-section__title"><RiBriefcaseLine /> Job Roles</div>
                <div className="cdp-chips">
                    {(full.jobRoles || []).map(r => (
                        <span key={r} className="cdp-chip cdp-chip--role">{r}</span>
                    ))}
                </div>
            </div>

            {full.prerequisites?.length > 0 && (
                <div className="cdp-section">
                    <div className="cdp-section__title"><RiInformationLine /> Prerequisites</div>
                    <div className="cdp-chips">
                        {full.prerequisites.map(p => (
                            <span key={p} className="cdp-chip cdp-chip--prereq">
                                {CERT_DB[p]?.name || p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SmartRecommendations({ ownedIds }) {
    const roadmap = useMemo(() => generateSmartRoadmap(ownedIds), [ownedIds]);

    if (!ownedIds.length) return null;

    return (
        <div className="smart-rec-section">
            <div className="smart-rec-section__title">
                <RiLightbulbLine /> Smart Recommendations based on your {ownedIds.length} certification(s)
            </div>
            {roadmap.recommended.length > 0 ? (
                <div className="smart-rec-grid">
                    {roadmap.recommended.map(c => (
                        <div key={c.id} className="smart-rec-card">
                            <div className="smart-rec-card__name">{c.name}</div>
                            <div className="smart-rec-card__issuer">{c.issuer}</div>
                            <div className="smart-rec-card__meta">
                                <span style={{ color: LEVEL_COLORS[c.level] }}>{LEVEL_LABELS[c.level]}</span>
                                <span>· {c.durationMonths}mo</span>
                                <span>· {c.cost}</span>
                            </div>
                            <div className="smart-rec-card__arrow"><RiArrowRightLine /></div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="smart-rec-empty">You've covered all direct next steps — explore advanced certs below!</p>
            )}

            {roadmap.skillGaps.length > 0 && (
                <div className="skill-gap-section">
                    <div className="skill-gap-section__title">⚡ Skill Gap Analysis</div>
                    <div className="skill-gap-list">
                        {roadmap.skillGaps.map(c => (
                            <div key={c.id} className="skill-gap-item">
                                <span className="skill-gap-item__dot" />
                                <span className="skill-gap-item__name">{c.name}</span>
                                <span className="skill-gap-item__tag">{c.issuer}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Legend ──────────────────────────────────────────────── */
function RoadmapLegend() {
    return (
        <div className="roadmap-legend">
            <span className="roadmap-legend__item roadmap-legend__item--owned">
                <RiCheckboxCircleFill /> Owned
            </span>
            <span className="roadmap-legend__item roadmap-legend__item--unlocked">
                <RiAwardLine /> Unlocked
            </span>
            <span className="roadmap-legend__item roadmap-legend__item--locked">
                <RiLockLine /> Locked
            </span>
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────────── */
const RoadmapPage = () => {
    const { getMyCerts } = useData();
    const { user } = useAuth();
    const myCerts = getMyCerts();

    const [activeDomain, setActiveDomain] = useState('cloud');
    const [selectedCert, setSelectedCert] = useState(null);
    const [search, setSearch] = useState('');

    const ownedIds = useMemo(() => matchOwnedCerts(myCerts), [myCerts]);

    const domainGraph = useMemo(
        () => buildDomainGraph(activeDomain, ownedIds),
        [activeDomain, ownedIds]
    );

    const domainInfo = DOMAINS.find(d => d.id === activeDomain);

    // Filter nodes by search
    const filteredGraph = useMemo(() => {
        if (!search.trim()) return domainGraph;
        const q = search.toLowerCase();
        return domainGraph.map(level =>
            level.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.issuer.toLowerCase().includes(q) ||
                (c.skills || []).some(s => s.toLowerCase().includes(q))
            )
        ).filter(l => l.length);
    }, [domainGraph, search]);

    const ownedInDomain = domainGraph.flat().filter(c => c.owned).length;
    const totalInDomain = domainGraph.flat().length;
    const progressPct = totalInDomain ? Math.round((ownedInDomain / totalInDomain) * 100) : 0;

    return (
        <div className="roadmap-page fade-up">
            {/* Header */}
            <div className="roadmap-page__header">
                <div>
                    <h1 className="page-title">
                        <RiRoadMapLine style={{ verticalAlign: 'middle', marginRight: 10 }} />
                        Certification Roadmap
                    </h1>
                    <p className="page-subtitle">
                        AI-matched paths across 6 domains · {Object.keys(CERT_DB).length} certifications mapped
                    </p>
                </div>
                {myCerts.length === 0 && (
                    <Link to="/add-certification" className="btn-primary-custom" id="roadmap-add-cert-btn">
                        <RiAwardLine /> Add a Cert to Unlock Recommendations
                    </Link>
                )}
            </div>

            {/* Smart Recommendations */}
            <SmartRecommendations ownedIds={ownedIds} />

            {/* Domain selector */}
            <div className="domain-selector" id="domain-selector">
                {DOMAINS.map(d => (
                    <DomainCard
                        key={d.id}
                        domain={d}
                        active={activeDomain === d.id}
                        onClick={() => { setActiveDomain(d.id); setSelectedCert(null); }}
                    />
                ))}
            </div>

            {/* Domain banner + progress */}
            <div
                className="domain-banner"
                style={{ '--domain-gradient': domainInfo?.gradient }}
            >
                <div className="domain-banner__left">
                    <span className="domain-banner__icon">{domainInfo?.icon}</span>
                    <div>
                        <div className="domain-banner__name">{domainInfo?.label}</div>
                        <div className="domain-banner__desc">{domainInfo?.description}</div>
                    </div>
                </div>
                <div className="domain-banner__progress" title={`${ownedInDomain}/${totalInDomain} owned`}>
                    <div className="domain-banner__progress-label">
                        {ownedInDomain}/{totalInDomain} certs owned
                    </div>
                    <div className="domain-banner__progress-bar">
                        <div
                            className="domain-banner__progress-fill"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className="domain-banner__progress-pct">{progressPct}%</div>
                </div>
            </div>

            {/* Search */}
            <div className="roadmap-search-bar">
                <RiSearchLine className="roadmap-search-bar__icon" />
                <input
                    type="text"
                    placeholder="Search certifications, skills, issuers…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    id="roadmap-search-input"
                />
                {search && (
                    <button className="roadmap-search-bar__clear" onClick={() => setSearch('')}>✕</button>
                )}
            </div>

            <RoadmapLegend />

            {/* Main layout: graph + detail */}
            <div className="roadmap-main-layout">
                {/* Visual graph */}
                <div className="roadmap-graph" id="roadmap-graph">
                    {filteredGraph.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-text">No certifications match your search</div>
                            <button className="btn-secondary-custom" style={{ marginTop: 12 }} onClick={() => setSearch('')}>
                                Clear Search
                            </button>
                        </div>
                    )}

                    {filteredGraph.map((level, li) => (
                        <div key={li} className="roadmap-graph__row">
                            <div className="roadmap-graph__row-label">
                                Level {li + 1}
                                <span>{LEVEL_LABELS[li + 1]}</span>
                            </div>
                            <div className="roadmap-graph__row-nodes">
                                {level.map(cert => (
                                    <CertNode
                                        key={cert.id}
                                        cert={cert}
                                        selected={selectedCert?.id === cert.id}
                                        onClick={c => setSelectedCert(c.id === selectedCert?.id ? null : c)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail panel */}
                {selectedCert && (
                    <CertDetailPanel
                        cert={selectedCert}
                        onClose={() => setSelectedCert(null)}
                    />
                )}
            </div>

            {/* Info footer */}
            <div className="roadmap-info-footer">
                <RiInformationLine />
                <span>
                    Roadmap paths are generated from your <strong>{myCerts.length}</strong> tracked
                    certification(s). Add more to unlock personalised progression paths.
                    {user?.name && ` Logged in as ${user.name}.`}
                </span>
            </div>
        </div>
    );
};

export default RoadmapPage;
