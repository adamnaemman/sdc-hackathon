import { Router, type IRouter } from "express";
import {
  ListMarketSignalsResponse,
  ListWorkforceRolesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

export const roles = [
  {
    id: "ai-operations",
    title: "AI Operations Specialist",
    sector: "Technology & operations",
    summary:
      "Connects teams, workflows, and AI tools so routine work becomes more reliable, measurable, and useful.",
    requiredSkills: [
      "AI literacy",
      "Workflow automation",
      "Process mapping",
      "Data analysis",
      "Prompt design",
      "Data governance",
      "Stakeholder communication",
    ],
    transferableSkills: [
      "Process mapping",
      "Vendor communication",
      "Documentation",
      "Stakeholder communication",
      "Spreadsheet analysis",
      "Workflow coordination",
    ],
    sdgTargets: ["4.4", "8.2", "9.5"],
    outlook:
      "Emerging role title; demand varies by employer. Treat as a direction to explore, not a standardized occupation forecast.",
    disruptionExposure: 34,
    learningPathway: [
      {
        id: "ai-literacy",
        title: "Build practical AI literacy",
        skill: "AI literacy",
        description:
          "Learn where current AI tools are useful, where they fail, and how to check their outputs.",
        hours: 8,
        prerequisites: [],
        sdgTargets: ["4.4", "9.5"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals",
        costNote: "Free learning modules; optional exams may cost.",
      },
      {
        id: "process-mapping",
        title: "Map a repeatable workflow",
        skill: "Process mapping",
        description:
          "Document a real process, identify handoffs, and decide what should stay human-led.",
        hours: 6,
        prerequisites: [],
        sdgTargets: ["8.2"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/paths/introduction-process-advisor/",
        costNote: "Free learning materials.",
      },
      {
        id: "workflow-automation",
        title: "Prototype a no-code automation",
        skill: "Workflow automation",
        description:
          "Use triggers, approvals, and exception handling to automate a low-risk business task.",
        hours: 10,
        prerequisites: ["process-mapping", "ai-literacy"],
        sdgTargets: ["8.2", "9.5"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/paths/automate-process-power-automate/",
        costNote: "Free learning modules; some products have separate plans.",
      },
      {
        id: "responsible-ai",
        title: "Apply responsible AI checks",
        skill: "Data governance",
        description:
          "Practice privacy, bias, human review, and documentation checks before deploying an AI-supported workflow.",
        hours: 5,
        prerequisites: ["ai-literacy"],
        sdgTargets: ["4.4", "9.5"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/modules/introduction-to-microsofts-responsible-ai-approach",
        costNote: "Free learning resources; availability varies by region.",
      },
    ],
  },
  {
    id: "sustainable-supply-chain",
    title: "Sustainable Supply Chain Analyst",
    sector: "Smart logistics & sustainability",
    summary:
      "Uses procurement, supplier, and operations data to surface risk and support lower-impact supply decisions.",
    requiredSkills: [
      "Supply chain analytics",
      "ESG reporting",
      "Carbon accounting",
      "Data visualization",
      "Supplier risk analysis",
      "Advanced spreadsheet analysis",
      "Stakeholder communication",
    ],
    transferableSkills: [
      "Vendor communication",
      "Inventory auditing",
      "Procurement",
      "Spreadsheet analysis",
      "Supplier coordination",
      "Documentation",
    ],
    sdgTargets: ["4.4", "8.2", "12.6", "13.3"],
    outlook:
      "Adjacent role combining established supply-chain work with sustainability reporting; local demand should be validated.",
    disruptionExposure: 28,
    learningPathway: [
      {
        id: "supply-chain-basics",
        title: "Strengthen supply-chain fundamentals",
        skill: "Supply chain analytics",
        description:
          "Review the flow of goods, suppliers, inventory, and operational risk across a supply chain.",
        hours: 8,
        prerequisites: [],
        sdgTargets: ["8.2", "12.6"],
        provider: "OpenLearn · The Open University",
        url: "https://www.open.edu/openlearn/money-business/leadership-management/supply-chain-sustainability/content-section-0",
        costNote: "Free 8-hour course; free statement of participation on completion.",
      },
      {
        id: "spreadsheet-analysis",
        title: "Turn operational data into useful analysis",
        skill: "Advanced spreadsheet analysis",
        description:
          "Clean, summarize, and validate purchasing or inventory data before reporting trends.",
        hours: 10,
        prerequisites: [],
        sdgTargets: ["4.4", "8.2"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/paths/prepare-data-power-bi",
        costNote: "Free learning modules.",
      },
      {
        id: "esg-reporting",
        title: "Understand sustainability reporting",
        skill: "ESG reporting",
        description:
          "Learn how organizations describe environmental and social impacts in value chains.",
        hours: 8,
        prerequisites: ["supply-chain-basics"],
        sdgTargets: ["12.6", "13.3"],
        provider: "MITx · Supply Chain Management",
        url: "https://learn.mit.edu/courses/course-v1:MITxT+SCM.290x",
        costNote: "Free audit access to course materials; verified certificate is paid.",
      },
      {
        id: "supply-data-viz",
        title: "Build a supplier-risk dashboard",
        skill: "Data visualization",
        description:
          "Create a simple view of supplier concentration, delivery, and sustainability indicators.",
        hours: 12,
        prerequisites: ["spreadsheet-analysis", "esg-reporting"],
        sdgTargets: ["8.2", "12.6", "13.3"],
        provider: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/training/paths/prepare-data-power-bi",
        costNote: "Free learning modules; certification is optional.",
      },
    ],
  },
  {
    id: "operations-research",
    title: "Operations Research Analyst",
    sector: "Analytics & decision science",
    summary:
      "Applies quantitative methods to improve scheduling, inventory, routing, and other complex decisions.",
    requiredSkills: [
      "Statistical analysis",
      "Python",
      "Optimization modeling",
      "SQL",
      "Data visualization",
      "Problem framing",
      "Stakeholder communication",
    ],
    transferableSkills: [
      "Inventory auditing",
      "Spreadsheet analysis",
      "Process mapping",
      "Problem solving",
      "Stakeholder communication",
    ],
    sdgTargets: ["4.4", "8.2", "9.5"],
    outlook:
      "U.S. BLS projects 12% employment growth from 2025 to 2035; this is an occupation-wide U.S. estimate, not a local guarantee.",
    disruptionExposure: 24,
    learningPathway: [
      {
        id: "statistics-foundations",
        title: "Refresh statistics for decisions",
        skill: "Statistical analysis",
        description:
          "Practice distributions, sampling, uncertainty, and interpreting operational data.",
        hours: 12,
        prerequisites: [],
        sdgTargets: ["4.4"],
        provider: "Khan Academy",
        url: "https://www.khanacademy.org/math/statistics-probability",
        costNote: "Free learning materials.",
      },
      {
        id: "python-foundations",
        title: "Learn Python for data work",
        skill: "Python",
        description:
          "Use a notebook to load, inspect, and transform a small public dataset.",
        hours: 16,
        prerequisites: [],
        sdgTargets: ["4.4", "9.5"],
        provider: "Kaggle Learn",
        url: "https://www.kaggle.com/learn/python",
        costNote: "Free 5-hour micro-course.",
      },
      {
        id: "sql-analysis",
        title: "Query structured data with SQL",
        skill: "SQL",
        description:
          "Filter and summarize operational records with joins, grouping, and clear checks.",
        hours: 10,
        prerequisites: [],
        sdgTargets: ["4.4", "9.5"],
        provider: "Khan Academy",
        url: "https://www.khanacademy.org/computing/computer-programming/sql",
        costNote: "Free learning materials.",
      },
      {
        id: "optimization-modeling",
        title: "Frame and test an optimization problem",
        skill: "Optimization modeling",
        description:
          "Translate a scheduling or inventory question into constraints, objectives, and a testable model.",
        hours: 14,
        prerequisites: ["statistics-foundations", "python-foundations"],
        sdgTargets: ["8.2", "9.5"],
        provider: "MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/15-053x-optimization-methods-in-business-analytics-summer-2021",
        costNote: "Free course materials; no paid certificate required.",
      },
    ],
  },
] as const;

const signals = [
  {
    id: "logisticians-growth",
    title: "Logisticians employment outlook",
    category: "Role demand",
    value: 18,
    unit: "% projected growth",
    period: "2025–2035",
    summary:
      "U.S. employment is projected to grow 18%, compared with 3% for all occupations.",
    sourceName: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
    sourceUrl: "https://www.bls.gov/ooh/business-and-financial/logisticians.htm",
    geography: "United States",
    sourceNote:
      "National occupation-level projection; it is not a live vacancy count or a Malaysia-specific estimate.",
    published: "Projection period 2025–2035",
    live: false,
  },
  {
    id: "operations-research-growth",
    title: "Operations research analyst outlook",
    category: "Role demand",
    value: 12,
    unit: "% projected growth",
    period: "2025–2035",
    summary:
      "U.S. employment is projected to grow 12%, compared with 3% for all occupations.",
    sourceName: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
    sourceUrl: "https://www.bls.gov/ooh/math/operations-research-analysts.htm",
    geography: "United States",
    sourceNote:
      "National occupation-level projection; it is not a live vacancy count or a Malaysia-specific estimate.",
    published: "Projection period 2025–2035",
    live: false,
  },
  {
    id: "data-entry-decline",
    title: "Data entry keyer employment outlook",
    category: "Role demand",
    value: -25.5,
    unit: "% projected change",
    period: "2025–2035",
    summary:
      "U.S. employment is projected to decline 25.5% for data entry keyers, from 131,800 jobs in 2025 to 98,200 in 2035.",
    sourceName: "U.S. Bureau of Labor Statistics — Fastest Declining Occupations",
    sourceUrl: "https://www.bls.gov/emp/tables/fastest-declining-occupations.htm",
    geography: "United States",
    sourceNote:
      "A narrow occupation-level proxy for routine data entry, not a forecast for procurement assistants or all administrative work.",
    published: "Projection period 2025–2035",
    live: false,
  },
  {
    id: "admin-assistants-decline",
    title: "Secretaries and administrative assistants outlook",
    category: "Role demand",
    value: -2,
    unit: "% projected change",
    period: "2025–2035",
    summary:
      "U.S. employment is projected to decline 2% over the decade, while replacement needs still create many annual openings.",
    sourceName: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
    sourceUrl:
      "https://www.bls.gov/ooh/office-and-administrative-support/secretaries-and-administrative-assistants.htm",
    geography: "United States",
    sourceNote:
      "Occupation-wide national projection; it is not specific to procurement work or Malaysia.",
    published: "Projection period 2025–2035",
    live: false,
  },
  {
    id: "skills-change",
    title: "Core skills expected to change",
    category: "Skills outlook",
    value: 39,
    unit: "% of workers' core skills",
    period: "2025–2030",
    summary:
      "Employers surveyed expect 39% of workers' core skills to change by 2030.",
    sourceName: "World Economic Forum — Future of Jobs Report 2025",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    geography: "Global employer survey",
    sourceNote:
      "Survey-based employer expectations, not a measured change for an individual occupation.",
    published: "January 2025",
    live: false,
  },
  {
    id: "skills-gap-barrier",
    title: "Skills gaps as a barrier to transformation",
    category: "Skills outlook",
    value: 63,
    unit: "% of surveyed employers",
    period: "2025–2030",
    summary:
      "63% of surveyed employers identify skills gaps as a major barrier to business transformation.",
    sourceName: "World Economic Forum — Future of Jobs Report 2025",
    sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    geography: "Global employer survey",
    sourceNote:
      "Survey response, not a job-posting growth rate or a prediction for an individual worker.",
    published: "January 2025",
    live: false,
  },
] as const;

router.get("/workforce/roles", (_req, res) => {
  res.json(ListWorkforceRolesResponse.parse(roles));
});

router.get("/workforce/signals", (_req, res) => {
  res.json(ListMarketSignalsResponse.parse(signals));
});

export default router;
