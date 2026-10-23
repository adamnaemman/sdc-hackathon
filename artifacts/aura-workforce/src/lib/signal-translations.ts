/**
 * Bahasa Malaysia copy for the six market signals.
 *
 * The signals themselves come from the API (BLS and WEF figures). Rather than
 * changing the API contract for a presentation concern, the client swaps the
 * display text when the language is BM. The numbers, periods, source names and
 * source URLs are never touched — only the words around them.
 *
 * If an id is missing here, the English text is shown unchanged.
 */

type SignalTranslation = {
  title?: string;
  summary?: string;
  unit?: string;
  geography?: string;
  published?: string;
  sourceNote?: string;
};

export const signalBm: Record<string, SignalTranslation> = {
  "logisticians-growth": {
    title: "Prospek pekerjaan ahli logistik",
    summary: "Pekerjaan di Amerika Syarikat dijangka tumbuh 18%, berbanding 3% bagi semua pekerjaan.",
    unit: "% pertumbuhan dijangka",
    geography: "Amerika Syarikat",
    published: "Tempoh unjuran 2025–2035",
    sourceNote:
      "Unjuran peringkat pekerjaan kebangsaan; ia bukan kiraan kekosongan langsung atau anggaran khusus Malaysia.",
  },
  "operations-research-growth": {
    title: "Prospek penganalisis penyelidikan operasi",
    summary: "Pekerjaan di Amerika Syarikat dijangka tumbuh 12%, berbanding 3% bagi semua pekerjaan.",
    unit: "% pertumbuhan dijangka",
    geography: "Amerika Syarikat",
    published: "Tempoh unjuran 2025–2035",
    sourceNote:
      "Unjuran peringkat pekerjaan kebangsaan; ia bukan kiraan kekosongan langsung atau anggaran khusus Malaysia.",
  },
  "data-entry-decline": {
    title: "Prospek pekerjaan kerani kemasukan data",
    summary:
      "Pekerjaan di Amerika Syarikat dijangka menurun 25.5% bagi kerani kemasukan data, daripada 131,800 pekerjaan pada 2025 kepada 98,200 pada 2035.",
    unit: "% perubahan dijangka",
    geography: "Amerika Syarikat",
    published: "Tempoh unjuran 2025–2035",
    sourceNote:
      "Proksi sempit peringkat pekerjaan bagi kerja kemasukan data rutin, bukan ramalan untuk pembantu perolehan atau seluruh kerja pentadbiran.",
  },
  "admin-assistants-decline": {
    title: "Prospek setiausaha dan pembantu pentadbiran",
    summary:
      "Pekerjaan di Amerika Syarikat dijangka menurun 2% sepanjang dekad ini, namun keperluan penggantian masih mencipta banyak kekosongan tahunan.",
    unit: "% perubahan dijangka",
    geography: "Amerika Syarikat",
    published: "Tempoh unjuran 2025–2035",
    sourceNote: "Unjuran kebangsaan seluruh pekerjaan; ia tidak khusus kepada kerja perolehan atau Malaysia.",
  },
  "skills-change": {
    title: "Kemahiran teras dijangka berubah",
    summary: "Majikan yang ditinjau menjangka 39% kemahiran teras pekerja akan berubah menjelang 2030.",
    unit: "% kemahiran teras pekerja",
    geography: "Tinjauan majikan global",
    published: "Januari 2025",
    sourceNote: "Jangkaan majikan berdasarkan tinjauan, bukan perubahan yang diukur bagi sesuatu pekerjaan.",
  },
  "skills-gap-barrier": {
    title: "Jurang kemahiran sebagai penghalang transformasi",
    summary:
      "63% majikan yang ditinjau mengenal pasti jurang kemahiran sebagai penghalang utama transformasi perniagaan.",
    unit: "% majikan ditinjau",
    geography: "Tinjauan majikan global",
    published: "Januari 2025",
    sourceNote: "Respons tinjauan, bukan kadar pertumbuhan iklan kerja atau ramalan bagi individu.",
  },
};
