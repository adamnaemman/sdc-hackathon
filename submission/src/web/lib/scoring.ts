/**
 * SCORING ENGINE
 * ==============
 * Extracted from App.tsx so that it can be used from more than one place:
 * the dashboard, the role cards, and now the AI plan builder (which has to
 * score the *draft* profile before the user saves it).
 *
 * Everything here is pure: same input, same output. No dates, no randomness,
 * no network. That is deliberate — a career recommendation must be reproducible
 * and explainable, which is also why the AI is never allowed to invent these
 * numbers.
 */

import type { WorkforceRole } from '@workspace/api-client-react';

export type DisruptionMode = 'Moderate' | 'Aggressive';

export type ProfileData = {
  currentRole: string;
  industry: string;
  yearsExperience: number;
  skills: string[];
  competencies: string[];
  targetSectors: string[];
  weeklyHours: number;
};

/** Lowercase, strip everything that is not a letter or digit. */
export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Hand-written equivalences between the wording a worker uses and the wording
 * the catalogue uses. This is the bridge that makes "Microsoft Excel" count as
 * "spreadsheet analysis".
 */
const skillAliases: Record<string, string[]> = {
  'microsoft excel': ['spreadsheet analysis', 'advanced spreadsheet analysis', 'data analysis'],
  'manual po processing': ['procurement', 'workflow coordination', 'process mapping'],
  'vendor communication': ['stakeholder communication'],
  'inventory auditing': ['inventory management'],
};

/**
 * Does the profile already contain this skill?
 *
 * NOTE: this is a deliberately simple substring test. It is fast and testable,
 * but it is also the weakest part of the engine (it can produce false
 * positives, e.g. "data" inside "database"). Embedding-based matching is the
 * planned Phase 2 upgrade.
 */
export function hasProfileSkill(profile: ProfileData, targetSkill: string): boolean {
  const expand = (skill: string) => [skill, ...(skillAliases[skill.toLowerCase()] ?? [])].map(normalize);
  const target = expand(targetSkill);
  return [...profile.skills, ...profile.competencies].some((skill) =>
    expand(skill).some((mine) => target.some((wanted) => mine === wanted || mine.includes(wanted) || wanted.includes(mine))),
  );
}

/**
 * Fit score, 0-100.
 *
 *   45 base
 * + up to 25 for required skills the person already has
 * + up to 20 for transferable skills
 * +  8 for a target-sector match
 * + up to 6.3 for experience (capped at 15 years)
 * − disruption exposure (heavier in the Aggressive scenario)
 * + up to 12 for live market demand
 *
 * Clamped to 38-96 so the UI never claims certainty at either end.
 */
export function scoreRole(
  role: WorkforceRole,
  profile: ProfileData,
  mode: DisruptionMode,
  demandShare = 0,
): number {
  const requiredSkills = role.requiredSkills ?? [];
  const transferableSkills = role.transferableSkills ?? [];
  const direct = requiredSkills.length
    ? requiredSkills.filter((skill) => hasProfileSkill(profile, skill)).length / requiredSkills.length
    : 0;
  const transferable = transferableSkills.length
    ? transferableSkills.filter((skill) => hasProfileSkill(profile, skill)).length / transferableSkills.length
    : 0;
  const sectorMatch = profile.targetSectors.some(
    (sector) =>
      normalize(role.sector).includes(normalize(sector)) ||
      normalize(sector).includes(normalize(role.sector)),
  )
    ? 1
    : 0;
  const experienceLift = Math.min(profile.yearsExperience, 15) * 0.42;
  const intensity =
    mode === 'Aggressive'
      ? Number(role.disruptionExposure || 0) * 0.19
      : Number(role.disruptionExposure || 0) * 0.08;
  // Live demand contributes at most 12 points, so it can move a ranking but can
  // never override a candidate's own skills and goals.
  const demandLift = Math.max(0, Math.min(1, demandShare)) * 12;

  return Math.max(
    38,
    Math.min(
      96,
      Math.round(45 + direct * 25 + transferable * 20 + sectorMatch * 8 + experienceLift + demandLift - intensity),
    ),
  );
}

/** Transition urgency, 12-92. Higher means "start planning sooner", not "you will be fired". */
export function urgencyFor(role: WorkforceRole, mode: DisruptionMode, profile: ProfileData): number {
  const exposure = Number(role.disruptionExposure || 0);
  const skillGap = (role.requiredSkills ?? []).filter((skill) => !hasProfileSkill(profile, skill)).length;
  return Math.max(12, Math.min(92, Math.round(exposure * (mode === 'Aggressive' ? 1.35 : 0.65) + skillGap * 3)));
}
