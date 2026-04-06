const ROLE_CERTIFICATION_PATHS = {
    'cloud engineer': ['AWS Solutions Architect', 'Terraform Associate', 'Kubernetes Administrator'],
    'security engineer': ['Security+', 'CEH', 'CISSP'],
    'data engineer': ['Google Data Engineer', 'Databricks Engineer', 'AWS Data Analytics'],
    general: []
};

const CERTIFICATION_RULES = {
    'aws cloud practitioner': {
        recommended: ['AWS Solutions Architect', 'AWS SysOps Administrator'],
        advanced: ['AWS DevOps Professional', 'AWS Security Specialty'],
        optional: ['Terraform Associate', 'Kubernetes Administrator'],
        progression: [
            { phase: 'Architecture Foundations', duration: '2-3 months', targetCertifications: ['AWS Solutions Architect'] },
            { phase: 'Operations Depth', duration: '2-3 months', targetCertifications: ['AWS SysOps Administrator'] },
            { phase: 'Production Engineering', duration: '3-4 months', targetCertifications: ['AWS DevOps Professional'] }
        ],
        careerAdvice: [
            'Strengthen hands-on skills with IAM, VPC, and cost optimization labs.',
            'Take ownership of one deployment automation project in your current team.',
            'Build a public cloud portfolio with architecture diagrams and postmortems.'
        ]
    },
    'aws solutions architect': {
        recommended: ['AWS DevOps Professional', 'Terraform Associate'],
        advanced: ['AWS Security Specialty', 'Kubernetes Administrator'],
        optional: ['Google Professional Cloud Architect'],
        progression: [
            { phase: 'Automation', duration: '1-2 months', targetCertifications: ['Terraform Associate'] },
            { phase: 'Operations', duration: '2-3 months', targetCertifications: ['AWS DevOps Professional'] },
            { phase: 'Security and Platform', duration: '2-3 months', targetCertifications: ['AWS Security Specialty', 'Kubernetes Administrator'] }
        ],
        careerAdvice: [
            'Move from solution design to delivery by owning CI/CD and release reliability.',
            'Document architecture decisions with trade-offs to develop technical leadership.',
            'Mentor junior engineers on cloud design patterns and governance.'
        ]
    },
    'terraform associate': {
        recommended: ['Kubernetes Administrator', 'AWS DevOps Professional'],
        advanced: ['Terraform Professional'],
        optional: ['AWS Security Specialty'],
        progression: [
            { phase: 'IaC Scale-up', duration: '1-2 months', targetCertifications: ['Terraform Professional'] },
            { phase: 'Platform Automation', duration: '2-3 months', targetCertifications: ['Kubernetes Administrator'] }
        ],
        careerAdvice: [
            'Standardize reusable Terraform modules and policy-as-code checks.',
            'Contribute to environment drift detection and remediation workflows.',
            'Expand toward platform engineering by integrating IaC with Kubernetes.'
        ]
    },
    'kubernetes administrator': {
        recommended: ['CKS', 'AWS DevOps Professional'],
        advanced: ['Kubernetes Application Developer'],
        optional: ['AWS Security Specialty'],
        progression: [
            { phase: 'Cluster Security', duration: '2 months', targetCertifications: ['CKS'] },
            { phase: 'SRE and Delivery', duration: '2-3 months', targetCertifications: ['AWS DevOps Professional'] }
        ],
        careerAdvice: [
            'Lead cluster hardening and observability rollout for production workloads.',
            'Develop incident response runbooks and reliability SLOs.',
            'Build expertise in GitOps and progressive delivery strategies.'
        ]
    },
    'security+': {
        recommended: ['CEH', 'CISSP'],
        advanced: ['OSCP', 'CCSP'],
        optional: ['AWS Security Specialty'],
        progression: [
            { phase: 'Offensive Security Basics', duration: '2-3 months', targetCertifications: ['CEH'] },
            { phase: 'Security Leadership', duration: '4-6 months', targetCertifications: ['CISSP'] }
        ],
        careerAdvice: [
            'Focus on practical threat modeling and vulnerability prioritization.',
            'Start participating in internal security reviews and audits.',
            'Position yourself for security engineer roles by combining cloud + security skills.'
        ]
    },
    ceh: {
        recommended: ['CISSP', 'OSCP'],
        advanced: ['CCSP'],
        optional: ['AWS Security Specialty'],
        progression: [
            { phase: 'Advanced Exploitation', duration: '3-4 months', targetCertifications: ['OSCP'] },
            { phase: 'Security Architecture', duration: '4-6 months', targetCertifications: ['CISSP'] }
        ],
        careerAdvice: [
            'Move beyond tools into deep network and system exploitation fundamentals.',
            'Pair offensive findings with remediation plans to create business impact.',
            'Build a specialization track in cloud security assessments.'
        ]
    },
    'google data engineer': {
        recommended: ['Databricks Engineer', 'AWS Data Analytics'],
        advanced: ['Azure Data Engineer Associate'],
        optional: ['SnowPro Core'],
        progression: [
            { phase: 'Lakehouse Engineering', duration: '2 months', targetCertifications: ['Databricks Engineer'] },
            { phase: 'Cross-cloud Analytics', duration: '2-3 months', targetCertifications: ['AWS Data Analytics'] }
        ],
        careerAdvice: [
            'Deepen batch + streaming design to handle production-scale data pipelines.',
            'Add cost/performance tuning expertise for warehouse and lakehouse workloads.',
            'Broaden your profile by delivering data products with measurable business KPIs.'
        ]
    }
};

function normalizeName(value) {
    if (!value) return '';
    return String(value).trim().toLowerCase();
}

function normalizeRole(role) {
    const normalized = normalizeName(role);
    if (!normalized) return 'general';

    if (normalized.includes('cloud')) return 'cloud engineer';
    if (normalized.includes('security')) return 'security engineer';
    if (normalized.includes('data')) return 'data engineer';

    if (ROLE_CERTIFICATION_PATHS[normalized]) return normalized;
    return 'general';
}

export function mapRoleToCertificationPath(role) {
    const roleKey = normalizeRole(role);
    return {
        roleKey,
        recommended: [...(ROLE_CERTIFICATION_PATHS[roleKey] || ROLE_CERTIFICATION_PATHS.general)]
    };
}

export function getRecommendedCertifications(certification) {
    const certKey = normalizeName(certification);
    const certRule = CERTIFICATION_RULES[certKey];
    return certRule ? [...certRule.recommended] : [];
}

export function generateCertificationRoadmap(userCertifications = [], userRole = '') {
    const certificationNames = (userCertifications || []).map(cert =>
        typeof cert === 'string' ? cert : cert?.certName || cert?.name || ''
    );

    const completedSet = new Set(certificationNames.map(normalizeName).filter(Boolean));
    const rolePath = mapRoleToCertificationPath(userRole);

    const certRules = certificationNames
        .map(certification => CERTIFICATION_RULES[normalizeName(certification)])
        .filter(Boolean);

    const recommendedBase = certRules.flatMap(rule => rule.recommended || []);
    const recommendedNext = [...new Set(recommendedBase)]
        .filter(certification => !completedSet.has(normalizeName(certification)));

    const advancedPath = [...new Set(certRules.flatMap(rule => rule.advanced || []))]
        .filter(certification => !completedSet.has(normalizeName(certification)));

    const optionalCertifications = [...new Set(certRules.flatMap(rule => rule.optional || []))]
        .filter(certification => !completedSet.has(normalizeName(certification)));

    const certificateBasedProgression = certRules.flatMap(rule => rule.progression || []);

    const estimatedLearningProgression = certificateBasedProgression.length
        ? certificateBasedProgression
        : [];

    const roleFallbackHint = !certificationNames.length
        ? rolePath.recommended
        : [];

    const careerAdvice = [...new Set(certRules.flatMap(rule => rule.careerAdvice || []))];

    return {
        role: userRole || 'General Learner',
        roleKey: rolePath.roleKey,
        completedCertifications: certificationNames.filter(Boolean),
        recommendedNextCertifications: recommendedNext,
        advancedCertificationPath: advancedPath,
        optionalCertifications,
        estimatedLearningProgression,
        careerAdvice,
        roleFallbackHint,
        metadata: {
            recommendationSource: ['certification-progression'],
            extensibility: {
                aiRecommendationsReady: true,
                industryTrendsReady: true,
                skillGapDetectionReady: true
            }
        }
    };
}

export const ROADMAP_RULES = {
    rolePaths: ROLE_CERTIFICATION_PATHS,
    certificationProgressions: Object.fromEntries(
        Object.entries(CERTIFICATION_RULES).map(([certification, rule]) => [
            certification,
            rule.recommended || []
        ])
    ),
    certificationRules: CERTIFICATION_RULES
};
