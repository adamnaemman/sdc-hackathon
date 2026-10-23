/**
 * Bahasa Malaysia copy for checkpoint 02 (the profile builder).
 *
 * Kept in its own file so the main dictionary stays readable. Skill, tool,
 * sector and competency *names* are not translated: they are controlled
 * vocabulary shared with the API and the catalogue, and translating them would
 * desynchronise the two.
 */

import type { Lang } from './i18n';

type ProfileCopy = {
  builder: string;
  builderTitle: string;
  privacyTitle: string;
  privacyBody: string;
  notSaved: string;
  description: string;
  steps: [string, string, string, string];
  stepWord: string;
  ofWord: string;
  completeWord: string;

  roleLabel: string;
  roleHint: string;
  rolePlaceholder: string;
  industryLabel: string;
  industryHint: string;
  industryPlaceholder: string;
  yearsLabel: string;
  yearsHint: string;
  yearsSuffix: string;
  startTitle: string;
  startBody: string;

  suggested: string;
  suggestedNote: string;
  emptyNote: string;
  failedNote: string;
  toolsTitle: string;
  toolsDesc: string;
  practicalTitle: string;
  practicalDesc: string;
  waysTitle: string;
  waysDesc: string;
  showAll: string;
  hideAll: string;
  competenciesTitle: string;
  competenciesDesc: string;

  groups: Record<'tools' | 'ops' | 'care' | 'data' | 'creative', { title: string; desc: string }>;

  addSkillTitle: string;
  addSkillHint: string;
  addSkillPlaceholder: string;
  add: string;
  definitions: string;
  glossary: string;
  fullReference: string;
  taxonomies: string;
  transferable: string;

  sectorsTitle: string;
  sectorsDesc: string;
  sectorLabel: string;
  sectorHint: string;
  sectorPlaceholder: string;

  hoursTitle: string;
  hoursBody: string;
  hoursLabel: string;
  hoursSuffix: string;
  skillsMetric: string;
  skillsCaption: string;
  sectorsMetric: string;
  sectorsCaption: string;
  rhythmMetric: string;
  rhythmCaption: string;

  back: string;
  updated: string;
  saveContinue: string;
  finding: string;
  apply: string;
  asking: string;
};

export const profileCopy: Record<Lang, ProfileCopy> = {
  en: {
    builder: 'Profile builder',
    builderTitle: 'A little context goes a long way.',
    privacyTitle: 'Privacy note',
    privacyBody: 'Profile details never leave the browser session. They are only used for local fit estimates.',
    notSaved: 'Not saved to an account',
    description:
      'A synthetic procurement example is loaded so you can explore the planner immediately. Edit it freely; your answers stay in memory and clear when this session ends.',
    steps: ['Starting point', 'Your strengths', 'Where to next', 'Time to learn'],
    stepWord: 'Step',
    ofWord: 'of',
    completeWord: 'complete',

    roleLabel: 'Current role',
    roleHint: 'What best describes your work today?',
    rolePlaceholder: 'e.g. Customer service team lead',
    industryLabel: 'Industry',
    industryHint: 'Your current field or sector — pick one or type your own',
    industryPlaceholder: 'e.g. Healthcare',
    yearsLabel: 'Years of experience',
    yearsHint: 'Across your working life',
    yearsSuffix: 'years',
    startTitle: 'Start where you are',
    startBody:
      'A career transition can build on existing knowledge. You do not need to start over to explore something new.',

    suggested: 'Suggested for you.',
    suggestedNote: 'Tools are pre-ticked because they are factual; tick the rest yourself.',
    emptyNote:
      "We couldn't map that role onto our skill list. Pick the closest options below — your years of experience still count.",
    failedNote: "We couldn't suggest skills automatically just now. Pick the ones that apply below.",
    toolsTitle: 'Tools & software',
    toolsDesc: 'What this role actually uses, according to the model.',
    practicalTitle: 'Practical skills for this role',
    practicalDesc: 'Tasks you would recognise from the job.',
    waysTitle: 'Ways of working',
    waysDesc: 'The people skills that matter in this role.',
    showAll: 'Something missing? Show the full skill list',
    hideAll: 'Hide the full skill list',
    competenciesTitle: 'People and work competencies',
    competenciesDesc: 'Strengths you use across many situations.',

    groups: {
      tools: { title: 'Tools & software', desc: 'The systems someone in this role actually opens.' },
      ops: { title: 'Business operations & procurement', desc: 'Work with suppliers, stock, money or hiring.' },
      care: { title: 'Care, education & customer-facing', desc: 'Work where the person in front of you is the job.' },
      data: { title: 'Data, documentation & process', desc: 'Turning records into something other people can use.' },
      creative: { title: 'Creative & project work', desc: 'Making things, and getting them finished with other people.' },
    },
    addSkillTitle: 'Add a skill or tool we missed',
    addSkillHint: 'Optional — it stays in your profile and is sent to the planner',
    addSkillPlaceholder: 'e.g. Blender, bookkeeping',
    add: 'Add',
    definitions: 'Definitions:',
    glossary: 'skill glossary (45 entries, PDF)',
    fullReference: 'Full reference: 1,000 O*NET technologies, A–Z (PDF)',
    taxonomies: 'Taxonomies:',
    transferable:
      'Transferable skills are not limited to formal job titles. Include experience from volunteering, caregiving, community work, and life.',

    sectorsTitle: 'Sectors you would like to explore',
    sectorsDesc: 'Choose any number. These preferences influence fit estimates, not eligibility.',
    sectorLabel: 'Add a sector or interest',
    sectorHint: 'Optional — enter a field not listed',
    sectorPlaceholder: 'e.g. Arts and culture',

    hoursTitle: 'A realistic weekly rhythm',
    hoursBody: 'Pathway timelines use your available learning hours.',
    hoursLabel: 'Hours available per week',
    hoursSuffix: 'hours',
    skillsMetric: 'Skills selected',
    skillsCaption: 'Strengths to build on',
    sectorsMetric: 'Sectors',
    sectorsCaption: 'Areas to explore',
    rhythmMetric: 'Study rhythm',
    rhythmCaption: 'Available each week',

    back: 'Back',
    updated: 'Updated for this session',
    saveContinue: 'Save & continue',
    finding: 'Finding your skills…',
    apply: 'Apply to role explorer',
    asking: 'Asking the AI…',
  },
  bm: {
    builder: 'Pembina profil',
    builderTitle: 'Sedikit konteks sudah memadai.',
    privacyTitle: 'Nota privasi',
    privacyBody: 'Butiran profil tidak pernah meninggalkan sesi pelayar. Ia hanya digunakan untuk anggaran padanan setempat.',
    notSaved: 'Tidak disimpan ke akaun',
    description:
      'Contoh perolehan sintetik dimuatkan supaya anda boleh terus meneroka perancang. Ubah dengan bebas; jawapan anda kekal dalam memori dan hilang apabila sesi tamat.',
    steps: ['Titik permulaan', 'Kekuatan anda', 'Ke mana seterusnya', 'Masa untuk belajar'],
    stepWord: 'Langkah',
    ofWord: 'daripada',
    completeWord: 'selesai',

    roleLabel: 'Peranan semasa',
    roleHint: 'Apa yang paling tepat menggambarkan kerja anda hari ini?',
    rolePlaceholder: 'cth. Ketua pasukan khidmat pelanggan',
    industryLabel: 'Industri',
    industryHint: 'Bidang atau sektor anda sekarang — pilih satu atau taip sendiri',
    industryPlaceholder: 'cth. Kesihatan',
    yearsLabel: 'Tahun pengalaman',
    yearsHint: 'Sepanjang hayat bekerja anda',
    yearsSuffix: 'tahun',
    startTitle: 'Mula dari tempat anda sekarang',
    startBody:
      'Peralihan kerjaya boleh dibina atas pengetahuan sedia ada. Anda tidak perlu mula dari kosong untuk meneroka sesuatu yang baharu.',

    suggested: 'Dicadangkan untuk anda.',
    suggestedNote: 'Alat ditanda awal kerana ia fakta; tandakan selebihnya sendiri.',
    emptyNote:
      'Kami tidak dapat memetakan peranan itu kepada senarai kemahiran kami. Pilih pilihan terdekat di bawah — pengalaman anda tetap dikira.',
    failedNote: 'Kami tidak dapat mencadangkan kemahiran secara automatik sebentar tadi. Pilih yang berkenaan di bawah.',
    toolsTitle: 'Alat & perisian',
    toolsDesc: 'Apa yang sebenarnya digunakan oleh peranan ini, menurut model.',
    practicalTitle: 'Kemahiran praktikal untuk peranan ini',
    practicalDesc: 'Tugasan yang anda kenali daripada kerja itu.',
    waysTitle: 'Cara bekerja',
    waysDesc: 'Kemahiran insaniah yang penting dalam peranan ini.',
    showAll: 'Ada yang tertinggal? Tunjuk senarai kemahiran penuh',
    hideAll: 'Sembunyikan senarai kemahiran penuh',
    competenciesTitle: 'Kompetensi insan dan kerja',
    competenciesDesc: 'Kekuatan yang anda gunakan dalam banyak keadaan.',

    groups: {
      tools: { title: 'Alat & perisian', desc: 'Sistem yang benar-benar dibuka oleh seseorang dalam peranan ini.' },
      ops: { title: 'Operasi perniagaan & perolehan', desc: 'Kerja dengan pembekal, stok, wang atau pengambilan pekerja.' },
      care: { title: 'Penjagaan, pendidikan & pelanggan', desc: 'Kerja di mana orang di hadapan anda ialah tugasnya.' },
      data: { title: 'Data, dokumentasi & proses', desc: 'Menukar rekod kepada sesuatu yang boleh digunakan orang lain.' },
      creative: { title: 'Kerja kreatif & projek', desc: 'Menghasilkan sesuatu, dan menyiapkannya bersama orang lain.' },
    },
    addSkillTitle: 'Tambah kemahiran atau alat yang kami terlepas',
    addSkillHint: 'Pilihan — ia kekal dalam profil anda dan dihantar kepada perancang',
    addSkillPlaceholder: 'cth. Blender, pembukuan',
    add: 'Tambah',
    definitions: 'Definisi:',
    glossary: 'glosari kemahiran (45 entri, PDF)',
    fullReference: 'Rujukan penuh: 1,000 teknologi O*NET, A–Z (PDF)',
    taxonomies: 'Taksonomi:',
    transferable:
      'Kemahiran boleh pindah tidak terhad kepada jawatan formal. Sertakan pengalaman daripada kesukarelawanan, penjagaan, kerja komuniti dan kehidupan.',

    sectorsTitle: 'Sektor yang ingin anda terokai',
    sectorsDesc: 'Pilih berapa banyak pun. Keutamaan ini mempengaruhi anggaran padanan, bukan kelayakan.',
    sectorLabel: 'Tambah sektor atau minat',
    sectorHint: 'Pilihan — masukkan bidang yang tiada dalam senarai',
    sectorPlaceholder: 'cth. Seni dan budaya',

    hoursTitle: 'Rentak mingguan yang realistik',
    hoursBody: 'Tempoh laluan menggunakan jam belajar yang anda ada.',
    hoursLabel: 'Jam tersedia setiap minggu',
    hoursSuffix: 'jam',
    skillsMetric: 'Kemahiran dipilih',
    skillsCaption: 'Kekuatan untuk dibina',
    sectorsMetric: 'Sektor',
    sectorsCaption: 'Bidang untuk diterokai',
    rhythmMetric: 'Rentak belajar',
    rhythmCaption: 'Tersedia setiap minggu',

    back: 'Kembali',
    updated: 'Dikemas kini untuk sesi ini',
    saveContinue: 'Simpan & teruskan',
    finding: 'Mencari kemahiran anda…',
    apply: 'Guna untuk peneroka peranan',
    asking: 'Bertanya kepada AI…',
  },
};
