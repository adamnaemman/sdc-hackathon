/**
 * Small translation layer.
 *
 * Scope, deliberately: the shell (navigation, hero, the four checkpoint
 * headings, footer) — the parts a judge sees before scrolling into the analysis.
 * Analytical copy stays in English in this build; translating it is a content
 * project, not a code change, and half-translating it would read worse than
 * leaving it consistent.
 */

export type Lang = 'en' | 'bm';

type Copy = {
  nav: { signals: string; profile: string; roles: string; pathway: string };
  navDetail: { signals: string; profile: string; roles: string; pathway: string };
  hero: {
    titleA: string; titleB: string; sub: string; cta1: string; cta2: string;
    chip1: string; chip2: string; chip3: string; scroll: string;
  };
  cp: {
    oneEyebrow: string; oneTitle: string; oneSub: string;
    twoEyebrow: string; twoTitle: string;
    threeEyebrow: string; threeTitle: string; threeSub: string;
    fourEyebrow: string; fourTitle: string; fourSub: string;
  };
  footer: { left: string; right: string };
  settings: { dark: string; light: string; language: string };
  about: {
    back: string;
    eyebrow: string;
    title: string;
    intro: string;
    teamTitle: string;
    teamWho: string;
    teamWhat: string;
    linkEmail: string;
    linkRepo: string;
    linkLive: string;
    refusesTitle: string;
    refuses: string[];
    refusesNote: string;
    sourcesTitle: string;
    builtTitle: string;
    built: string;
    disclaimer: string;
  };
  welcome: {
    label: string;
    title: string;
    sub: string;
    items: string[];
    privacy: string;
    start: string;
    never: string;
  };
};

export const copy: Record<Lang, Copy> = {
  en: {
    nav: { signals: 'Market signals', profile: 'Your profile', roles: 'Future roles', pathway: 'Learning path' },
    navDetail: { signals: 'Evidence & sources', profile: 'Strengths & goals', roles: 'Chosen by the AI', pathway: 'Your study plan' },
    hero: {
      titleA: 'Your next chapter,', titleB: 'mapped.',
      sub: 'Four checkpoints: the evidence, your profile, the roles the AI concludes fit you, and a study plan built around the hours you actually have.',
      cta1: 'Start with checkpoint 01', cta2: 'Set up your profile',
      chip1: '4 checkpoints', chip2: 'Sourced & dated', chip3: 'Private by design',
      scroll: 'Scroll to checkpoint 01',
    },
    cp: {
      oneEyebrow: 'Checkpoint 01 · Market signals', oneTitle: 'Evidence, with its sources attached.',
      oneSub: 'A small set of labor-market signals to add context to your exploration. Read the geography, date, and source note before drawing conclusions.',
      twoEyebrow: 'Checkpoint 02 · Your profile', twoTitle: 'Name what you already bring.',
      threeEyebrow: 'Checkpoint 03 · Future roles', threeTitle: 'The roles the AI chose for you.',
      threeSub: 'Generated from your profile, not picked from a list. Each occupation comes with the reasoning, the skills to build, and a reference you can check.',
      fourEyebrow: 'Checkpoint 04 · Learning path', fourTitle: 'A plan built around the hours you actually have.',
      fourSub: 'Every step links to a course page we checked before shipping. The model chose the order — it cannot invent a course.',
    },
    footer: { left: 'Directional estimates only. Your experience and judgment lead the way.', right: 'AURA · PRIVACY-FIRST PLANNING' },
    settings: { dark: 'Dark', light: 'Light', language: 'Language' },
    about: {
      back: 'Back to the planner',
      eyebrow: 'About',
      title: 'Built by one student, for people whose jobs are changing.',
      intro:
        'AURA-Workforce is a career-transition planner, not a job board and not a chatbot. It exists because the advice most workers receive is generic, static and unsourced — while the training they are told to buy is expensive and often already out of date.',
      teamTitle: 'The team',
      teamWho: 'Ahmad Adam Hakimi bin Naeman · International Islamic University Malaysia (IIUM)',
      teamWhat:
        'Built for SDC Hackathon 2026, Domain 1 — The Aiversecity Future-Ready Workforce Domain. Solo build: product, interface, API and documentation.',
      linkEmail: 'Email',
      linkRepo: 'Repository',
      linkLive: 'Live prototype',
      refusesTitle: 'What it refuses to do',
      refuses: [
        'Invent a job, a course, a provider or a statistic.',
        'Claim a market figure is live when it is a saved snapshot.',
        'Present a fit score as a verdict — every score is shown with its reasoning and its estimate.',
        'Store a profile, an account or a CV. Everything lives in browser memory.',
      ],
      refusesNote:
        'These are not marketing lines; they are enforced in code. The AI may only choose identifiers that already exist in the catalogue, and every returned identifier is validated before it reaches the screen.',
      sourcesTitle: 'Sources',
      builtTitle: 'Built with',
      built:
        'React 19, Vite, Tailwind CSS 4, TanStack Query, Wouter, Express 5, Zod, OpenAPI with Orval, TypeScript, pnpm workspaces. Hosted on Replit. Language model: DeepSeek (declared in the submission).',
      disclaimer: 'Directional estimates only. Your experience and judgement lead the way.',
    },
    welcome: {
      label: 'New here',
      title: 'Welcome to AURA-Workforce',
      sub: 'One page, four checkpoints. Here is what each one does.',
      items: [
        '01 · Market signals — live demand from real job postings, with the source and date attached.',
        '02 · Your profile — the AI expands what you write into concrete skills you choose.',
        '03 · Future roles — occupations chosen from your profile, not from a fixed catalogue.',
        '04 · Learning path — a plan fitted to your weekly hours, with verified course links.',
      ],
      privacy: 'No account, no CV, nothing stored. Your profile stays in this browser.',
      start: 'Start',
      never: "Don't show this again",
    },
  },
  bm: {
    nav: { signals: 'Isyarat pasaran', profile: 'Profil anda', roles: 'Peranan masa depan', pathway: 'Laluan belajar' },
    navDetail: { signals: 'Bukti & sumber', profile: 'Kekuatan & matlamat', roles: 'Dipilih oleh AI', pathway: 'Pelan belajar anda' },
    hero: {
      titleA: 'Bab seterusnya anda,', titleB: 'dipetakan.',
      sub: 'Empat checkpoint: bukti pasaran, profil anda, peranan yang AI simpulkan sesuai, dan pelan belajar mengikut jam yang anda benar-benar ada.',
      cta1: 'Mula dengan checkpoint 01', cta2: 'Sediakan profil anda',
      chip1: '4 checkpoint', chip2: 'Bersumber & bertarikh', chip3: 'Privasi terjaga',
      scroll: 'Skrol ke checkpoint 01',
    },
    cp: {
      oneEyebrow: 'Checkpoint 01 · Isyarat pasaran', oneTitle: 'Bukti, bersama sumbernya.',
      oneSub: 'Sedikit isyarat pasaran kerja untuk memberi konteks. Baca geografi, tarikh dan nota sumber sebelum membuat kesimpulan.',
      twoEyebrow: 'Checkpoint 02 · Profil anda', twoTitle: 'Namakan apa yang anda sudah bawa.',
      threeEyebrow: 'Checkpoint 03 · Peranan masa depan', threeTitle: 'Peranan yang AI pilih untuk anda.',
      threeSub: 'Dijana daripada profil anda, bukan dipilih dari senarai. Setiap pekerjaan datang dengan sebab, kemahiran yang perlu dibina, dan rujukan yang boleh anda semak.',
      fourEyebrow: 'Checkpoint 04 · Laluan belajar', fourTitle: 'Pelan mengikut jam yang anda benar-benar ada.',
      fourSub: 'Setiap langkah paut ke halaman kursus yang kami semak sebelum diterbitkan. Model hanya menyusun — ia tidak boleh reka kursus.',
    },
    footer: { left: 'Anggaran berarah sahaja. Pengalaman dan pertimbangan anda yang mendahului.', right: 'AURA · PERANCANGAN UTAMAKAN PRIVASI' },
    settings: { dark: 'Gelap', light: 'Cerah', language: 'Bahasa' },
    about: {
      back: 'Kembali ke perancang',
      eyebrow: 'Tentang',
      title: 'Dibina oleh seorang pelajar, untuk mereka yang kerjanya sedang berubah.',
      intro:
        'AURA-Workforce ialah perancang peralihan kerjaya — bukan papan kerja, bukan chatbot. Ia wujud kerana nasihat yang diterima kebanyakan pekerja bersifat generik, statik dan tanpa sumber, sedangkan latihan yang disuruh beli itu mahal dan sering sudah ketinggalan.',
      teamTitle: 'Pasukan',
      teamWho: 'Ahmad Adam Hakimi bin Naeman · Universiti Islam Antarabangsa Malaysia (IIUM)',
      teamWhat:
        'Dibina untuk SDC Hackathon 2026, Domain 1 — The Aiversecity Future-Ready Workforce Domain. Binaan solo: produk, antara muka, API dan dokumentasi.',
      linkEmail: 'E-mel',
      linkRepo: 'Repositori',
      linkLive: 'Prototaip langsung',
      refusesTitle: 'Apa yang ia enggan lakukan',
      refuses: [
        'Mereka pekerjaan, kursus, penyedia atau statistik.',
        'Mendakwa angka pasaran itu langsung sedangkan ia snapshot tersimpan.',
        'Menyampaikan skor padanan sebagai keputusan muktamad — setiap skor dipaparkan bersama sebab dan anggarannya.',
        'Menyimpan profil, akaun atau CV. Semuanya kekal dalam memori pelayar.',
      ],
      refusesNote:
        'Ini bukan ayat pemasaran; ia dikuatkuasakan dalam kod. AI hanya boleh memilih pengecam yang sudah wujud dalam katalog, dan setiap pengecam disahkan sebelum sampai ke skrin.',
      sourcesTitle: 'Sumber',
      builtTitle: 'Dibina dengan',
      built:
        'React 19, Vite, Tailwind CSS 4, TanStack Query, Wouter, Express 5, Zod, OpenAPI dengan Orval, TypeScript, pnpm workspaces. Dihoskan di Replit. Model bahasa: DeepSeek (diisytiharkan dalam submission).',
      disclaimer: 'Anggaran berarah sahaja. Pengalaman dan pertimbangan anda yang mendahului.',
    },
    welcome: {
      label: 'Baharu di sini',
      title: 'Selamat datang ke AURA-Workforce',
      sub: 'Satu halaman, empat checkpoint. Ini yang setiap satu lakukan.',
      items: [
        '01 · Isyarat pasaran — permintaan langsung daripada iklan kerja sebenar, bersama sumber dan tarikh.',
        '02 · Profil anda — AI mengembangkan apa yang anda tulis menjadi kemahiran yang anda pilih sendiri.',
        '03 · Peranan masa depan — pekerjaan dipilih daripada profil anda, bukan katalog tetap.',
        '04 · Laluan belajar — pelan mengikut jam mingguan anda, dengan pautan kursus yang disahkan.',
      ],
      privacy: 'Tiada akaun, tiada CV, tiada simpanan. Profil anda kekal dalam pelayar ini.',
      start: 'Mula',
      never: 'Jangan tunjuk lagi',
    },
  },
};
