import { describe, it, expect } from 'vitest';
import {
  mapRoleToCertificationPath,
  getRecommendedCertifications,
  generateCertificationRoadmap
} from './roadmapUtils';

describe('roadmapUtils', () => {
  it('mapRoleToCertificationPath detects cloud engineer', () => {
    const { roleKey, recommended } = mapRoleToCertificationPath('Senior Cloud Engineer');
    expect(roleKey).toBe('cloud engineer');
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended).toContain('AWS Solutions Architect');
  });

  it('getRecommendedCertifications returns AWS path for practitioner', () => {
    const next = getRecommendedCertifications('AWS Cloud Practitioner');
    expect(next).toContain('AWS Solutions Architect');
  });

  it('generateCertificationRoadmap suggests next certs after practitioner', () => {
    const roadmap = generateCertificationRoadmap(
      [{ certName: 'AWS Cloud Practitioner' }],
      'Cloud Engineer'
    );
    expect(roadmap.completedCertifications).toContain('AWS Cloud Practitioner');
    expect(roadmap.recommendedNextCertifications).toContain('AWS Solutions Architect');
  });
});
