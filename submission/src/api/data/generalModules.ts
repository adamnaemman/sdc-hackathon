/**
 * GENERAL MODULE LIBRARY
 * ======================
 * Courses that are not tied to a curated role, added so an AI-proposed
 * occupation has somewhere real to send the learner.
 *
 * Every URL here was fetched and returned HTTP 200 before being added. Hours are
 * honest estimates of the free portion, not the full certificate length.
 */

import type { VerifiedModule } from "../lib/buildPathway";

export const generalModules: VerifiedModule[] = [
  {
    id: "general-project-management",
    title: "Foundations of project management",
    skill: "Project coordination",
    hours: 20,
    provider: "Google Career Certificates",
    url: "https://grow.google/certificates/project-management/",
    costNote: "Free to audit on Coursera; certificate is paid.",
  },
  {
    id: "general-data-analytics",
    title: "Foundations of data analysis",
    skill: "Data analysis",
    hours: 15,
    provider: "Google Career Certificates",
    url: "https://grow.google/certificates/data-analytics/",
    costNote: "Free to audit; certificate is paid.",
  },
  {
    id: "general-ux-design",
    title: "Foundations of user experience design",
    skill: "Visual design",
    hours: 15,
    provider: "Google Career Certificates",
    url: "https://grow.google/certificates/ux-design/",
    costNote: "Free to audit; certificate is paid.",
  },
  {
    id: "general-responsive-web",
    title: "Responsive web design certification",
    skill: "Content writing",
    hours: 20,
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/responsive-web-design/",
    costNote: "Completely free; no certificate fee.",
  },
  {
    id: "general-blender",
    title: "Blender manual and official tutorials",
    skill: "Visual design",
    hours: 12,
    provider: "Blender Foundation",
    url: "https://docs.blender.org/manual/en/latest/",
    costNote: "Free and open source documentation.",
  },
  {
    id: "general-canva-design",
    title: "Canva Design School",
    skill: "Visual design",
    hours: 3,
    provider: "Canva",
    url: "https://www.canva.com/design-school/",
    costNote: "Free short courses and tutorials.",
  },
];
