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
  ask: {
    button: string;
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    disclaimer: string;
    suggestions: string[];
    error: string;
  };
  trend: {
    label: string;
    cached: string;
    stale: string;
    loading: string;
    error: string;
    refresh: string;
    refreshing: string;
    chartTitle: string;
    lastWeeks: string;
    note: string;
    postings: string;
    days: string;
    fetched: string;
    source: string;
    mentionsOf: string;
  };
  signals: {
    badge: string;
    contextTitle: string;
    contextBody: string;
    reviewed: string;
    all: string;
    search: string;
    snapshot: string;
    liveSource: string;
    reportedValue: string;
    period: string;
    sourceNote: string;
    originalSource: string;
    shown: string;
    snapshots: string;
    notLive: string;
    noSignalsTitle: string;
    noSignalsBody: string;
    noViewTitle: string;
    noViewBody: string;
    categoryMap: Record<string, string>;
  };
  plan: {
    verifiedFor: string;
    topicFor: string;
    totalTime: string;
    estimatedTime: string;
    atWeek: string;
    hours: string;
    weeks: string;
    weekLabel: string;
    topicIntroBefore: string;
    topicIntroAfter: string;
    topicBadge: string;
    searchOn: string;
    verifiedNote: string;
    topicNote: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    exportPdf: string;
    exportHint: string;
    showQr: string;
    printTitle: string;
    printSub: string;
    printNote: string;
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
    ask: {
      button: 'Ask AURA',
      title: 'Ask AURA',
      subtitle: 'Answers about how this page works — not job advice.',
      placeholder: 'Ask how the app works…',
      send: 'Send',
      thinking: 'Thinking…',
      disclaimer: "Answered from this app's own help text. It cannot invent features, courses or jobs.",
      suggestions: [
        'What do the four checkpoints do?',
        'Why is my pathway empty?',
        'Is my profile saved?',
        'Where does the data come from?',
      ],
      error: 'The assistant is unavailable right now.',
    },
    trend: {
      label: 'Live skill demand',
      cached: 'cached',
      stale: 'last good snapshot',
      loading: 'Reading the public job feed…',
      error: 'The live source could not be reached just now. The curated signals below still work; nothing here is replaced with invented numbers.',
      refresh: 'Refresh',
      refreshing: 'Refreshing',
      chartTitle: 'Mentions per week · most requested skills',
      lastWeeks: 'last 4 weeks',
      note: 'Mentions of each skill in recent public job postings, bucketed by week. This is the whole feed, not a shortlist of our roles — it signals direction, not Malaysian vacancy counts, and it is not a forecast for any individual.',
      postings: 'postings from the last',
      days: 'days',
      fetched: 'fetched',
      source: 'source',
      mentionsOf: 'mentions',
    },
    signals: {
      badge: 'Sourced snapshots · not a live feed',
      contextTitle: 'Context, not certainty',
      contextBody: 'These figures are sourced snapshots, not real-time updates or forecasts. Labor data can lag, vary by geography, and describe broad groups rather than individual outcomes. Open each source to review the original methodology.',
      reviewed: 'Source links reviewed 21 Oct 2026 · each card shows its source period or publication date',
      all: 'All signals',
      search: 'Find a signal',
      snapshot: 'Snapshot',
      liveSource: 'Source marked live',
      reportedValue: 'Reported value',
      period: 'Period',
      sourceNote: 'Source note',
      originalSource: 'Original source',
      shown: 'shown',
      snapshots: 'snapshots',
      notLive: 'None should be read as a live feed',
      noSignalsTitle: 'No market signals yet',
      noSignalsBody: 'Sourced indicators will appear here when available.',
      noViewTitle: 'No signals in this view',
      noViewBody: 'Try another category or search phrase.',
      categoryMap: { 'Role demand': 'Role demand', 'Skills outlook': 'Skills outlook' },
    },
    plan: {
      verifiedFor: 'Verified plan for',
      topicFor: 'Topic plan for',
      totalTime: 'Total learning time',
      estimatedTime: 'Estimated time',
      atWeek: 'At',
      hours: 'hours',
      weeks: 'weeks approx.',
      weekLabel: 'week',
      topicIntroBefore: 'No verified course exists for',
      topicIntroAfter: 'yet, so the planner wrote the study topics instead. Each link opens a search for that topic.',
      topicBadge: 'Topics · search links, not courses',
      searchOn: 'Search this topic on',
      verifiedNote: 'Course links were verified before publishing. Confirm availability with the provider.',
      topicNote: 'Hours are our estimate of the study time, not a provider figure. Pick one course per topic yourself.',
      emptyTitle: 'No plan yet',
      emptyBody: 'Choose one of the roles in checkpoint 03 and press Build verified pathway — the plan appears here, fitted to your weekly hours.',
      emptyCta: 'Go to checkpoint 03',
      exportPdf: 'Export PDF',
      exportHint: 'Includes a QR code for every course step.',
      showQr: 'QR code',
      printTitle: 'Learning plan',
      printSub: 'Directional plan · confirm details with the provider',
      printNote: 'Generated by AURA-Workforce. Course links were verified before publishing.',
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
    ask: {
      button: 'Tanya AURA',
      title: 'Tanya AURA',
      subtitle: 'Jawapan tentang cara halaman ini berfungsi — bukan nasihat kerja.',
      placeholder: 'Tanya cara app ini berfungsi…',
      send: 'Hantar',
      thinking: 'Sedang berfikir…',
      disclaimer: 'Dijawab daripada teks bantuan app ini. Ia tidak boleh reka ciri, kursus atau pekerjaan.',
      suggestions: [
        'Apa fungsi empat checkpoint?',
        'Kenapa laluan saya kosong?',
        'Adakah profil saya disimpan?',
        'Dari mana data diambil?',
      ],
      error: 'Pembantu tidak tersedia sekarang.',
    },
    trend: {
      label: 'Permintaan kemahiran langsung',
      cached: 'cache',
      stale: 'snapshot terakhir',
      loading: 'Membaca suapan kerja awam…',
      error: 'Sumber langsung tidak dapat dihubungi sebentar tadi. Isyarat bersumber di bawah masih berfungsi; tiada angka rekaan menggantikannya.',
      refresh: 'Muat semula',
      refreshing: 'Memuat semula',
      chartTitle: 'Sebutan setiap minggu · kemahiran paling dicari',
      lastWeeks: '4 minggu terakhir',
      note: 'Sebutan setiap kemahiran dalam iklan kerja awam terkini, dikumpul mengikut minggu. Ini seluruh suapan, bukan senarai pendek peranan kami — ia menunjukkan arah, bukan jumlah kekosongan Malaysia, dan bukan ramalan untuk individu.',
      postings: 'iklan kerja dari',
      days: 'hari terakhir',
      fetched: 'diambil',
      source: 'sumber',
      mentionsOf: 'sebutan',
    },
    signals: {
      badge: 'Snapshot bersumber · bukan suapan langsung',
      contextTitle: 'Konteks, bukan kepastian',
      contextBody: 'Angka ini ialah snapshot bersumber, bukan kemas kini masa nyata atau ramalan. Data buruh boleh lambat, berbeza mengikut geografi, dan menggambarkan kumpulan luas bukan hasil individu. Buka setiap sumber untuk meneliti metodologi asal.',
      reviewed: 'Pautan sumber disemak 21 Okt 2026 · setiap kad menunjukkan tempoh atau tarikh terbitan sumbernya',
      all: 'Semua isyarat',
      search: 'Cari isyarat',
      snapshot: 'Snapshot',
      liveSource: 'Sumber ditanda langsung',
      reportedValue: 'Nilai dilaporkan',
      period: 'Tempoh',
      sourceNote: 'Nota sumber',
      originalSource: 'Sumber asal',
      shown: 'dipaparkan',
      snapshots: 'snapshot',
      notLive: 'Tiada satu pun patut dibaca sebagai suapan langsung',
      noSignalsTitle: 'Belum ada isyarat pasaran',
      noSignalsBody: 'Penunjuk bersumber akan muncul di sini apabila tersedia.',
      noViewTitle: 'Tiada isyarat dalam paparan ini',
      noViewBody: 'Cuba kategori atau frasa carian lain.',
      categoryMap: { 'Role demand': 'Permintaan peranan', 'Skills outlook': 'Prospek kemahiran' },
    },
    plan: {
      verifiedFor: 'Pelan disahkan untuk',
      topicFor: 'Pelan topik untuk',
      totalTime: 'Jumlah masa belajar',
      estimatedTime: 'Anggaran masa',
      atWeek: 'Pada',
      hours: 'jam',
      weeks: 'minggu lebih kurang',
      weekLabel: 'minggu',
      topicIntroBefore: 'Belum ada kursus yang disahkan untuk',
      topicIntroAfter: ', jadi perancang menulis topik belajar. Setiap pautan membuka carian untuk topik itu.',
      topicBadge: 'Topik · pautan carian, bukan kursus',
      searchOn: 'Cari topik ini di',
      verifiedNote: 'Pautan kursus disahkan sebelum diterbitkan. Sahkan ketersediaan dengan penyedia.',
      topicNote: 'Jam ialah anggaran masa belajar kami, bukan angka penyedia. Pilih satu kursus bagi setiap topik.',
      emptyTitle: 'Belum ada pelan',
      emptyBody: 'Pilih salah satu peranan di checkpoint 03 dan tekan Bina laluan disahkan — pelan akan muncul di sini, mengikut jam mingguan anda.',
      emptyCta: 'Pergi ke checkpoint 03',
      exportPdf: 'Muat turun PDF',
      exportHint: 'Termasuk kod QR bagi setiap langkah kursus.',
      showQr: 'Kod QR',
      printTitle: 'Pelan belajar',
      printSub: 'Pelan berarah · sahkan butiran dengan penyedia',
      printNote: 'Dijana oleh AURA-Workforce. Pautan kursus disahkan sebelum diterbitkan.',
    },
  },
};
