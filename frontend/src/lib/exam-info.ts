// Per-certification exam composition + study strategy.
// Source: ISTQB Exam Structures & Rules tables v1.17 (May 2026).
//
// Used by the Study Guide tab to give learners a concrete plan: how many
// questions, where they come from, where K3 difficulty concentrates, how
// to budget time, and what admin to expect.

export interface ChapterBreakdown {
  number: string;
  title: string;
  questionCount: number;
  pointCount: number;
  k1?: number;
  k2?: number;
  k3?: number;
  k4?: number;
  /** Set true to visually flag this chapter as a focus area. */
  focus?: boolean;
  /** Optional one-line note explaining why this chapter matters. */
  note?: string;
}

export interface KLevelEntry {
  count: number;
  minutesPerQ: number;
}

export interface ExamInfo {
  acronym: string;
  fullName: string;
  version: string;
  /** One-paragraph laid-back intro to set expectations. */
  intro: string;
  totalQuestions: number;
  totalPoints: number;
  passingPoints: number;
  passingPercentage: number;
  examMinutes: number;
  examMinutesExtended: number;
  kLevels: {
    k1?: KLevelEntry;
    k2?: KLevelEntry;
    k3?: KLevelEntry;
    k4?: KLevelEntry;
  };
  chapters: ChapterBreakdown[];
  /** One-line headline that tells learners where to focus. */
  focusHeadline: string;
  /** Bullet-style tips for approaching the exam. */
  strategyTips: string[];
  administrative: {
    registration: string;
    format: string;
    retakes: string;
    prep: string;
  };
}

const ALL: ExamInfo[] = [
  {
    acronym: "CTFL",
    fullName: "Certified Tester Foundation Level",
    version: "v4.0.1",
    intro:
      "The foundation-stone exam for everyone in the ISTQB scheme. It is broad, mostly conceptual, and only mildly technical. If you can read a syllabus carefully and practise a few hands-on techniques from Chapter 4, you can pass this.",
    totalQuestions: 40,
    totalPoints: 40,
    passingPoints: 26,
    passingPercentage: 65,
    examMinutes: 60,
    examMinutesExtended: 75,
    kLevels: {
      k1: { count: 8, minutesPerQ: 1 },
      k2: { count: 24, minutesPerQ: 1 },
      k3: { count: 8, minutesPerQ: 3 },
    },
    chapters: [
      {
        number: "1",
        title: "Fundamentals of Testing",
        questionCount: 8,
        pointCount: 8,
        k1: 2,
        k2: 6,
        k3: 0,
        note: "Concepts and vocabulary — quick wins if you know your definitions.",
      },
      {
        number: "2",
        title: "Testing Throughout the SDLC",
        questionCount: 6,
        pointCount: 6,
        k1: 2,
        k2: 4,
        k3: 0,
      },
      {
        number: "3",
        title: "Static Testing",
        questionCount: 4,
        pointCount: 4,
        k1: 2,
        k2: 2,
        k3: 0,
        note: "Smallest chapter outside Chapter 6 — don't overspend study time here.",
      },
      {
        number: "4",
        title: "Test Analysis and Design",
        questionCount: 11,
        pointCount: 11,
        k1: 0,
        k2: 6,
        k3: 5,
        focus: true,
        note: "Biggest chapter and home of most K3 questions. Drill EP, BVA, decision tables, state transitions.",
      },
      {
        number: "5",
        title: "Managing the Test Activities",
        questionCount: 9,
        pointCount: 9,
        k1: 1,
        k2: 5,
        k3: 3,
        focus: true,
        note: "Estimation, prioritisation, defect reports — the other K3-heavy chapter.",
      },
      {
        number: "6",
        title: "Test Tools",
        questionCount: 2,
        pointCount: 2,
        k1: 1,
        k2: 1,
        k3: 0,
        note: "Only 2 questions — skim this, don't memorise.",
      },
    ],
    focusHeadline:
      "Chapters 4 and 5 are 20 out of 40 questions (50%) — and they hold every single K3 question. Spend most of your practice time here.",
    strategyTips: [
      "Time budget: K1/K2 questions get ~1 minute each, K3 questions get ~3 minutes. The 8 K3 questions alone eat 24 of your 60 minutes — pace yourself.",
      "Pass mark is 26 out of 40 points (65%). One point per question regardless of K-level. You can get up to 14 wrong and still pass.",
      "Sweep the K1/K2 questions first to bank points, then come back for the K3 questions where you actually need scratch paper.",
      "Chapter 4 K3s usually give you a small spec and ask you to derive test cases, count partitions, or fill a decision table. Practise these on real examples — reading is not enough.",
      "Chapter 5 K3s often include the three-point estimation formula: E = (a + 4m + b) / 6. Memorise it — it is the easiest K3 mark on the paper.",
      "Watch for traps: 'testing equals execution only' (false), 'verification = validation' (false), '100% statement coverage = 100% branch coverage' (false).",
    ],
    administrative: {
      registration:
        "Register through your local ISTQB-recognised member board (e.g. ASTQB in the US, ISTQB SA in South Africa, GTB in Germany). They list accredited exam providers — Pearson VUE, iSQI, BCS, and others depending on region.",
      format:
        "40 multiple-choice questions, 60 minutes (75 minutes if you sit in a non-native English language). Closed book — no notes, no reference materials. Delivered online with a remote proctor or at a physical test centre.",
      retakes:
        "Retake policies vary by member board. Most allow a retake after a short waiting period (often 24 hours to 2 weeks). Each attempt is paid separately. Failing does not affect future attempts.",
      prep:
        "Plan for 20-30 hours of focused study plus 100-200 practice questions. Most candidates pass on their first attempt after working through the syllabus once and timing themselves on a full mock exam.",
    },
  },
  {
    acronym: "CTFL-AT",
    fullName: "Certified Tester Foundation Level Agile Tester",
    version: "v2014",
    intro:
      "A Foundation-level companion to CTFL focused on testing inside Agile teams. Shorter syllabus, similar difficulty, but with more focus on collaboration and Agile-specific practices.",
    totalQuestions: 40,
    totalPoints: 40,
    passingPoints: 26,
    passingPercentage: 65,
    examMinutes: 90,
    examMinutesExtended: 113,
    kLevels: {
      k1: { count: 10, minutesPerQ: 1 },
      k2: { count: 22, minutesPerQ: 1 },
      k3: { count: 8, minutesPerQ: 3 },
    },
    chapters: [
      {
        number: "1",
        title: "Agile Software Development",
        questionCount: 13,
        pointCount: 13,
        k1: 5,
        k2: 7,
        k3: 1,
        focus: true,
        note: "Biggest chapter — Agile basics, Whole Team approach, retrospectives.",
      },
      {
        number: "2",
        title: "Fundamental Agile Testing Principles, Practices, and Processes",
        questionCount: 12,
        pointCount: 12,
        k1: 1,
        k2: 11,
        k3: 0,
      },
      {
        number: "3",
        title: "Agile Testing Methods, Techniques, and Tools",
        questionCount: 15,
        pointCount: 15,
        k1: 4,
        k2: 4,
        k3: 7,
        focus: true,
        note: "All K3 questions land here — drill ATDD test derivation, exploratory charters, test estimation.",
      },
    ],
    focusHeadline:
      "Chapter 3 holds all 7 K3 questions and the bulk of the technique work. Chapter 1 carries the most overall questions.",
    strategyTips: [
      "Note the longer exam: 90 minutes for 40 questions (CTFL gives you 60). The extra time exists because Agile K3 scenarios tend to be wordier.",
      "Practise writing user stories with acceptance criteria — both Given/When/Then and rule-oriented formats are fair game.",
      "Know the difference between Scrum, Kanban, and XP at a definition level. The exam will not test deep Scrum knowledge but will test labels.",
      "Whole Team approach, Three Amigos, and Definition of Done all appear regularly — treat them as guaranteed terms.",
    ],
    administrative: {
      registration:
        "Same member board route as CTFL. Most boards require CTFL as a prerequisite for sitting CTFL-AT.",
      format:
        "40 multiple-choice questions, 90 minutes. Closed book.",
      retakes:
        "Same as other Foundation Level exams — varies by member board, typically allowed after a short waiting period.",
      prep:
        "If you already hold CTFL, plan ~15 hours of additional study. If not, do CTFL first.",
    },
  },
  {
    acronym: "CTAL-TA",
    fullName: "Certified Tester Advanced Level Test Analyst",
    version: "v4.0",
    intro:
      "The v4.0 Test Analyst is a major rewrite — far more practical than Foundation. It centres on the business-facing testing role: black-box and experience-based techniques, functional and user-facing non-functional testing, and defect prevention. There are no K1 recall questions; over half the marks require you to actively apply (K3) or analyse (K4) a technique. The syllabus spends 615 of its 1215 training minutes on Chapter 3 alone, which is exactly where the exam concentrates.",
    totalQuestions: 45,
    totalPoints: 78,
    passingPoints: 51,
    passingPercentage: 65,
    examMinutes: 120,
    examMinutesExtended: 150,
    kLevels: {
      k2: { count: 18, minutesPerQ: 1 },
      k3: { count: 21, minutesPerQ: 3 },
      k4: { count: 6, minutesPerQ: 4 },
    },
    chapters: [
      {
        number: "1",
        title: "The Tasks of the Test Analyst in the Test Process",
        questionCount: 8,
        pointCount: 9,
        k2: 7,
        k3: 1,
        note: "225 min. Mostly K2 tasks across analysis, design, implementation, execution. The one K3 is keyword-driven test scripting.",
      },
      {
        number: "2",
        title: "The Tasks of the Test Analyst in Risk-Based Testing",
        questionCount: 3,
        pointCount: 7,
        k2: 1,
        k4: 2,
        note: "90 min. Small, but point-rich — both K4 questions analyse change impact to scope regression testing.",
      },
      {
        number: "3",
        title: "Test Analysis and Test Design",
        questionCount: 22,
        pointCount: 42,
        k2: 4,
        k3: 16,
        k4: 2,
        focus: true,
        note: "615 min — half the syllabus and 42 of 78 points. K3 apply-a-technique objectives dominate: domain, combinatorial, state transition, scenario, decision table, metamorphic, charters, checklists.",
      },
      {
        number: "4",
        title: "Testing Quality Characteristics",
        questionCount: 4,
        pointCount: 4,
        k2: 4,
        note: "60 min — the smallest chapter, all K2: functional, usability, flexibility, compatibility testing. Understand, don't over-study.",
      },
      {
        number: "5",
        title: "Software Defect Prevention",
        questionCount: 8,
        pointCount: 16,
        k2: 2,
        k3: 4,
        k4: 2,
        focus: true,
        note: "225 min, 16 points. Two K3 (modelling for defects + reviews) and two K4 (analysing test results), plus defect prevention and RCA.",
      },
    ],
    focusHeadline:
      "Chapter 3 alone is 42 of 78 points — more than half the exam, and almost every K3 technique lives there. Master domain, combinatorial, state transition, scenario, decision table, and metamorphic testing before exam day.",
    strategyTips: [
      "Point weighting: K2 = 1 point, K3 = 2 points (occasionally 1 or 3 at the author's discretion), K4 = 3 points (occasionally 2). Not all questions are equal — protect the high-value ones.",
      "No K1 questions exist, but you still must remember the glossary definition of every keyword listed under a chapter heading — those underpin the K2 questions.",
      "K4 means analyse — a scenario where you reason about change impact for regression (Ch2), select techniques to mitigate risk (Ch3), or interpret test results to improve detection (Ch5). Slow down; these 6 questions are worth 18 points.",
      "Time per question averages ~2.7 minutes. Sweep the K2 questions first, then spend real time on the K3 technique work in Chapter 3.",
      "Counts here match the official ISTQB CTAL-TA v4.1 sample exam (45 questions, 78 points) — the same one in the Practice Questions tab. Work it under timed conditions before exam day.",
    ],
    administrative: {
      registration:
        "Requires the CTFL Foundation certificate as a prerequisite. Register via your local ISTQB member board.",
      format:
        "Multiple-choice, 120 minutes (150 with the +25% non-native-language allowance). Closed book. Minimum 40 questions per the Exam Structures & Rules; 65% of available points to pass.",
      retakes:
        "Varies by member board; typically a longer waiting period than Foundation exams.",
      prep:
        "Plan 40-60 hours including hands-on technique practice. The K3/K4 load is real — drill the Chapter 3 techniques on worked examples, not just by reading.",
    },
  },
  {
    acronym: "CTAL-TM",
    fullName: "Certified Tester Advanced Level Test Management",
    version: "v3.0",
    intro:
      "Advanced Level for people who manage testing — planning, risk, metrics, defect management, team leadership. Heavy on K4 (analysis) questions where you compare scenarios.",
    totalQuestions: 50,
    totalPoints: 86,
    passingPoints: 56,
    passingPercentage: 65,
    examMinutes: 120,
    examMinutesExtended: 150,
    kLevels: {
      k2: { count: 26, minutesPerQ: 1 },
      k3: { count: 10, minutesPerQ: 3 },
      k4: { count: 14, minutesPerQ: 4 },
    },
    chapters: [
      {
        number: "1",
        title: "Managing the Test Activities",
        questionCount: 26,
        pointCount: 46,
        k2: 14,
        k3: 4,
        k4: 8,
        focus: true,
        note: "Over half the exam. Covers test plan, risk-based testing, monitoring, completion. Drill the K4 risk scenarios.",
      },
      {
        number: "2",
        title: "Managing Product Risk",
        questionCount: 15,
        pointCount: 27,
        k2: 7,
        k3: 4,
        k4: 4,
        focus: true,
      },
      {
        number: "3",
        title: "Reviews",
        questionCount: 9,
        pointCount: 15,
        k2: 5,
        k3: 2,
        k4: 2,
      },
    ],
    focusHeadline:
      "Chapter 1 is 46 of 86 points — over half the exam. Combined with Chapter 2 (risk), the test-management mechanics carry 73 of 86 points.",
    strategyTips: [
      "Longest of the Advanced exams at 50 questions. Average ~2.4 minutes per question — keep moving.",
      "K4 questions (14 of them, worth 3 points each = 42 points) are roughly half your pass margin. Practise scenario-comparison questions specifically.",
      "Risk-based testing concepts appear everywhere. Memorise risk level = likelihood × impact and the four risk activities (identification, assessment, mitigation, monitoring).",
      "Defect reports, test reports, and metric interpretation all appear regularly — practise reading sample reports and spotting problems.",
    ],
    administrative: {
      registration:
        "Requires CTFL as a prerequisite. Some member boards strongly recommend prior project experience.",
      format:
        "50 multiple-choice questions, 120 minutes. Closed book.",
      retakes:
        "Varies by member board.",
      prep:
        "Plan 50-70 hours of study. Hands-on management experience accelerates this significantly.",
    },
  },
  {
    acronym: "CTAL-TTA",
    fullName: "Certified Tester Advanced Level Technical Test Analyst",
    version: "v4.0",
    intro:
      "Advanced Level for testers who work close to the code — white-box techniques, static analysis, non-functional testing, security and reliability. Expect technical scenarios.",
    totalQuestions: 45,
    totalPoints: 78,
    passingPoints: 51,
    passingPercentage: 65,
    examMinutes: 120,
    examMinutesExtended: 150,
    kLevels: {
      k2: { count: 20, minutesPerQ: 1 },
      k3: { count: 17, minutesPerQ: 3 },
      k4: { count: 8, minutesPerQ: 4 },
    },
    chapters: [
      {
        number: "1",
        title: "Risk-Based Testing",
        questionCount: 2,
        pointCount: 2,
        k2: 2,
      },
      {
        number: "2",
        title: "Structure-Based Testing",
        questionCount: 8,
        pointCount: 17,
        k2: 1,
        k3: 5,
        k4: 2,
        focus: true,
        note: "White-box techniques: statement, branch, decision, MCDC. K3 heavy.",
      },
      {
        number: "3",
        title: "Analytical Techniques",
        questionCount: 7,
        pointCount: 14,
        k3: 7,
        focus: true,
        note: "100% K3 — every question is apply-a-technique.",
      },
      {
        number: "4",
        title: "Quality Characteristics for Technical Testing",
        questionCount: 13,
        pointCount: 21,
        k2: 7,
        k3: 4,
        k4: 2,
        focus: true,
        note: "Performance, security, reliability — the largest chapter.",
      },
      {
        number: "5",
        title: "Reviews",
        questionCount: 5,
        pointCount: 13,
        k2: 1,
        k4: 4,
        note: "Small chapter but K4-heavy — point-rich per question.",
      },
      {
        number: "6",
        title: "Test Tools and Automation",
        questionCount: 10,
        pointCount: 11,
        k2: 9,
        k3: 1,
      },
    ],
    focusHeadline:
      "Chapter 4 (Quality Characteristics) carries 21 points, Chapter 2 (white-box) carries 17, Chapter 3 (Analytical) is all K3. These three are your study core.",
    strategyTips: [
      "Chapter 3 has zero K2 questions — every question requires you to actually apply a technique. No memorisation shortcuts.",
      "Know your white-box coverage hierarchy cold: statement ⊆ branch ⊆ decision ⊆ MCDC.",
      "Non-functional quality characteristics from ISO 25010 appear repeatedly — performance efficiency, security, reliability, maintainability, portability.",
      "Static analysis tools (cyclomatic complexity, control flow graphs) come up in K3 questions. Practise computing complexity from a CFG.",
    ],
    administrative: {
      registration:
        "Requires CTFL. Many candidates take this alongside CTAL-TA.",
      format:
        "45 multiple-choice questions, 120 minutes. Closed book.",
      retakes:
        "Varies by member board.",
      prep:
        "Plan 40-60 hours. A development background helps with the structure-based chapters.",
    },
  },
  {
    acronym: "CTAL-TAE",
    fullName: "Certified Tester Advanced Level Test Automation Engineering",
    version: "v2.0",
    intro:
      "Advanced Level for test automation engineers — TAA design, framework choices, deployment, reporting, transitioning manual to automated. Practical and tool-aware.",
    totalQuestions: 40,
    totalPoints: 66,
    passingPoints: 43,
    passingPercentage: 65,
    examMinutes: 90,
    examMinutesExtended: 113,
    kLevels: {
      k2: { count: 20, minutesPerQ: 1 },
      k3: { count: 14, minutesPerQ: 3 },
      k4: { count: 6, minutesPerQ: 4 },
    },
    chapters: [
      {
        number: "1",
        title: "Introduction and Objectives",
        questionCount: 3,
        pointCount: 3,
        k2: 3,
      },
      {
        number: "2",
        title: "Preparing for Test Automation",
        questionCount: 5,
        pointCount: 9,
        k2: 3,
        k4: 2,
      },
      {
        number: "3",
        title: "Generic Test Automation Architecture",
        questionCount: 6,
        pointCount: 10,
        k2: 2,
        k3: 8,
        focus: true,
        note: "K3-heavy — the TAA framework chapter.",
      },
      {
        number: "4",
        title: "Risks and Contingencies",
        questionCount: 4,
        pointCount: 7,
        k2: 2,
        k3: 1,
        k4: 1,
      },
      {
        number: "5",
        title: "Test Automation Reporting and Metrics",
        questionCount: 6,
        pointCount: 8,
        k2: 4,
        k3: 4,
      },
      {
        number: "6",
        title: "Transitioning Manual Testing to Automated",
        questionCount: 4,
        pointCount: 8,
        k2: 1,
        k3: 2,
        k4: 1,
      },
      {
        number: "7",
        title: "Verifying the TAS",
        questionCount: 6,
        pointCount: 8,
        k2: 4,
        k3: 2,
      },
      {
        number: "8",
        title: "Continuous Improvement",
        questionCount: 6,
        pointCount: 13,
        k2: 1,
        k3: 3,
        k4: 2,
        focus: true,
        note: "Small in questions but 13 points — well above its size.",
      },
    ],
    focusHeadline:
      "Chapters 3 and 8 punch above their weight in points. Chapter 5 (reporting) is also worth a focused session.",
    strategyTips: [
      "Generic Test Automation Architecture (gTAA) appears in many K3 questions. Know the three layers: generation, definition, execution.",
      "Be ready to read sample test reports and spot what is missing or misleading.",
      "Transitioning from manual to automated comes up — know the criteria for which tests to automate first.",
      "ROI calculations and break-even analysis show up in K3 questions. Have the formulas to hand.",
    ],
    administrative: {
      registration:
        "Requires CTFL.",
      format:
        "40 multiple-choice questions, 90 minutes. Closed book.",
      retakes:
        "Varies by member board.",
      prep:
        "Plan 30-50 hours. Practical automation experience helps substantially.",
    },
  },
  {
    acronym: "CTAL-AT",
    fullName: "Certified Tester Advanced Level Agile Tester",
    version: "v2.0",
    intro:
      "Advanced Level for testers leading testing in Agile teams. Heavy on collaboration, planning, and the testing quadrants. Some K4 questions where you analyse Agile scenarios.",
    totalQuestions: 40,
    totalPoints: 52,
    passingPoints: 34,
    passingPercentage: 65,
    examMinutes: 90,
    examMinutesExtended: 113,
    kLevels: {
      k2: { count: 31, minutesPerQ: 1.5 },
      k3: { count: 6, minutesPerQ: 3 },
      k4: { count: 3, minutesPerQ: 4 },
    },
    chapters: [
      {
        number: "1",
        title: "Agile and Test Process",
        questionCount: 5,
        pointCount: 5,
        k2: 5,
      },
      {
        number: "2",
        title: "Test Planning, Monitoring, and Control",
        questionCount: 5,
        pointCount: 5,
        k2: 5,
      },
      {
        number: "3",
        title: "Test Analysis and Design",
        questionCount: 7,
        pointCount: 11,
        k2: 5,
        k4: 2,
      },
      {
        number: "4",
        title: "Test Implementation and Execution",
        questionCount: 9,
        pointCount: 11,
        k2: 7,
        k3: 2,
        focus: true,
      },
      {
        number: "5",
        title: "Evaluating Test Tools and Considerations for Use",
        questionCount: 12,
        pointCount: 18,
        k2: 7,
        k3: 4,
        k4: 1,
        focus: true,
        note: "Largest by points — testing quadrants, exit criteria, retrospective metrics.",
      },
      {
        number: "6",
        title: "Test Tools in Agile",
        questionCount: 2,
        pointCount: 2,
        k2: 2,
      },
    ],
    focusHeadline:
      "Chapter 5 carries 18 of 52 points. Chapters 4 and 5 together hold most of the K3 work.",
    strategyTips: [
      "K2 questions get 1.5 minutes each (most exams give 1) — the questions tend to be longer scenarios.",
      "Know the Testing Quadrants (Marick) inside out — quadrant questions appear in multiple chapters.",
      "Be comfortable distinguishing exit criteria, Definition of Done, and Definition of Ready.",
      "K4 questions are scenario analyses — slow down on these, they are worth 3 points each.",
    ],
    administrative: {
      registration:
        "Requires both CTFL and CTFL-AT (Agile Tester Foundation).",
      format:
        "40 multiple-choice questions, 90 minutes. Closed book.",
      retakes:
        "Varies by member board.",
      prep:
        "Plan 30-50 hours. Agile project experience is more useful here than for most exams.",
    },
  },
];

// Direct mapping from catalog slug → exam acronym.
// Slugs are seeded in backend/.../Seed/catalog.json.
const SLUG_TO_ACRONYM: Record<string, string> = {
  "istqb-foundation": "CTFL",
  "istqb-agile-tester": "CTFL-AT",
  "istqb-advanced-agile-tester": "CTAL-AT",
  "istqb-advanced-test-analyst": "CTAL-TA",
  "istqb-advanced-test-management": "CTAL-TM",
  "istqb-advanced-technical-test-analyst": "CTAL-TTA",
  "istqb-advanced-test-automation-engineering": "CTAL-TAE",
};

export function getExamInfo(slug: string): ExamInfo | null {
  const acronym = SLUG_TO_ACRONYM[slug];
  if (!acronym) return null;
  return ALL.find((e) => e.acronym === acronym) ?? null;
}
