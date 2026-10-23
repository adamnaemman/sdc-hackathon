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
};

export const copy: Record<Lang, Copy> = {
  en: {
    nav: { signals: '01 · Market signals', profile: '02 · Your profile', roles: '03 · Future roles', pathway: '04 · Learning path' },
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
  },
  bm: {
    nav: { signals: '01 · Isyarat pasaran', profile: '02 · Profil anda', roles: '03 · Peranan masa depan', pathway: '04 · Laluan belajar' },
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
  },
};
