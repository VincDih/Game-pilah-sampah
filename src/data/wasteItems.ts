export type WasteCategory = 'organik' | 'anorganik' | 'b3';
export type SceneLocation = 'sekolah' | 'rumah' | 'lapangan';

export interface SceneConfig {
  id: SceneLocation;
  label: string;
  subtitle: string;
  imageUrl: string;
  fallbackGradient: string;
  welcomeQuote: string;
}

export const SCENE_CONFIGS: Record<SceneLocation, SceneConfig> = {
  sekolah: {
    id: 'sekolah',
    label: 'Di Sekolah',
    subtitle: 'Ruang kelas cerah',
    imageUrl: '/src/assets/images/classroom_eco_backdrop_1795060218445.jpg',
    fallbackGradient: 'from-amber-100/70 via-[#FFFDF7] to-emerald-50/70',
    welcomeQuote:
      'Halo murid-murid hebat! Ayo jaga kelas kita tetap bersih dengan memilah sampah bersama!',
  },
  rumah: {
    id: 'rumah',
    label: 'Di Rumah',
    subtitle: 'Ruang keluarga & dapur',
    imageUrl: '/src/assets/images/home_eco_backdrop_1795060850987.jpg',
    fallbackGradient: 'from-orange-100/70 via-[#FFFDF7] to-amber-50/70',
    welcomeQuote:
      'Meow! Di rumah juga banyak sampah dari dapur dan mainan. Yuk bantu keluarga memilahnya!',
  },
  lapangan: {
    id: 'lapangan',
    label: 'Di Lapangan',
    subtitle: 'Taman & halaman luas',
    imageUrl: '/src/assets/images/field_eco_backdrop_1795060850945.jpg',
    fallbackGradient: 'from-sky-100/80 via-[#FFFDF7] to-emerald-100/60',
    welcomeQuote:
      'Segarnya udara di lapangan! Ayo pastikan tidak ada sampah berserakan di taman bermain kita!',
  },
};

export const SCENE_ORDER: SceneLocation[] = ['sekolah', 'rumah', 'lapangan'];

export const CAT_QUOTES = {
  thinking: [
    'Amati gambarnya baik-baik ya, kamu pasti bisa!',
    'Coba pikirkan, benda ini berasal dari alam, plastik, atau berbahaya?',
    'Pelan-pelan saja, Mr.Meow percaya padamu!',
    'Lihat bentuk dan bahannya, lalu ketuk tempat sampah yang pas!',
  ],
  cheering: [
    'Wah, hebat sekali! Pilihanmu tepat sasaran!',
    'Keren! Bumi pasti tersenyum melihatmu memilah sampah!',
    'Mantap! Kamu makin jago menjaga lingkungan!',
    'Betul sekali! Teruskan semangatmu ya!',
  ],
  combo: [
    'Luar biasa! Combo beruntun! Kamu memang juara kelas!',
    'Wah, fokus sekali! Mr.Meow bangga melihat prestasimu!',
    'Hebat banget! Terus pertahankan ketelitianmu!',
  ],
  encouraging: [
    'Tidak apa-apa! Salah itu tandanya kita sedang belajar hal baru.',
    'Semangat terus! Yuk baca faktanya supaya makin ingat ya!',
    'Hampir tepat! Sekarang kamu sudah tahu tempat yang benar.',
  ],
};

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  hint: string;
  fact: string;
}

export interface BinConfig {
  id: WasteCategory;
  title: string;
  shortTitle: string;
  subtitle: string;
  shortcut: string;
  bgClass: string;
  hoverBgClass: string;
  borderClass: string;
  textClass: string;
  badgeBgClass: string;
  accentHex: string;
  ruleSummary: string;
}

export const BIN_CONFIGS: Record<WasteCategory, BinConfig> = {
  organik: {
    id: 'organik',
    title: 'Sampah Organik',
    shortTitle: 'ORGANIK',
    subtitle: 'Sisa makanan, buah & daun',
    shortcut: '1',
    bgClass: 'bg-emerald-50',
    hoverBgClass: 'hover:bg-emerald-100 active:bg-emerald-200',
    borderClass: 'border-emerald-600',
    textClass: 'text-emerald-900',
    badgeBgClass: 'bg-emerald-600 text-white',
    accentHex: '#16A34A',
    ruleSummary: 'Berasal dari makhluk hidup, mudah membusuk, dan bisa diolah menjadi pupuk kompos.',
  },
  anorganik: {
    id: 'anorganik',
    title: 'Sampah Anorganik',
    shortTitle: 'ANORGANIK',
    subtitle: 'Plastik, kertas, kaca & kaleng',
    shortcut: '2',
    bgClass: 'bg-amber-50',
    hoverBgClass: 'hover:bg-amber-100 active:bg-amber-200',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-950',
    badgeBgClass: 'bg-amber-500 text-slate-950',
    accentHex: '#D97706',
    ruleSummary: 'Sulit membusuk di tanah, tetapi masih bersih dan bisa didaur ulang menjadi barang baru.',
  },
  b3: {
    id: 'b3',
    title: 'Sampah B3',
    shortTitle: 'B3',
    subtitle: 'Beracun, kimia & elektronik',
    shortcut: '3',
    bgClass: 'bg-rose-50',
    hoverBgClass: 'hover:bg-rose-100 active:bg-rose-200',
    borderClass: 'border-rose-600',
    textClass: 'text-rose-950',
    badgeBgClass: 'bg-rose-600 text-white',
    accentHex: '#DC2626',
    ruleSummary: 'Mengandung bahan berbahaya, racun, kuman medis, atau komponen elektronik yang harus ditangani khusus.',
  },
};

export const BIN_ORDER: WasteCategory[] = ['organik', 'anorganik', 'b3'];

export const WASTE_ITEMS: WasteItem[] = [
  // ORGANIK (8 items)
  {
    id: 'kulit-pisang',
    name: 'Kulit Pisang',
    category: 'organik',
    hint: 'Berasal dari buah yang cepat membusuk di tanah.',
    fact: 'Kulit pisang mudah diuraikan oleh mikroba tanah dalam beberapa minggu dan bisa menjadi pupuk kompos kaya kalium untuk tanaman!',
  },
  {
    id: 'sisa-apel',
    name: 'Sisa Buah Apel',
    category: 'organik',
    hint: 'Bagian buah yang tersisa setelah kita makan.',
    fact: 'Sisa buah seperti bonggol apel termasuk sampah organik basah yang sangat bagus dijadikan kompos atau pakan cacing tanah.',
  },
  {
    id: 'daun-kering',
    name: 'Daun Kering',
    category: 'organik',
    hint: 'Gugur dari pohon di halaman sekolah.',
    fact: 'Daun kering yang dikumpulkan di halaman sekolah bisa dicacah dan dicampur tanah untuk menjadi pupuk kompos penyubur kebun.',
  },
  {
    id: 'sisa-nasi',
    name: 'Sisa Nasi & Lauk',
    category: 'organik',
    hint: 'Makanan yang tersisa di kotak bekal.',
    fact: 'Sisa makanan mudah membusuk. Mengambil makanan secukupnya dan mengomposkan sisanya membantu mengurangi gas berlebih di tempat sampah.',
  },
  {
    id: 'tulang-ikan',
    name: 'Tulang Ikan',
    category: 'organik',
    hint: 'Berasal dari hewan dan bisa terurai alami.',
    fact: 'Tulang ikan berasal dari makhluk hidup sehingga masuk kategori organik dan dapat diolah menjadi tepung pupuk alami.',
  },
  {
    id: 'cangkang-telur',
    name: 'Cangkang Telur',
    category: 'organik',
    hint: 'Kulit luar telur ayam yang rapuh dan alami.',
    fact: 'Cangkang telur mengandung kalsium tinggi! Jika diremukkan dan ditabur ke kompos, tanaman di pot sekolah tumbuh lebih kuat.',
  },
  {
    id: 'kulit-jeruk',
    name: 'Kulit Jeruk',
    category: 'organik',
    hint: 'Bagian luar buah segar yang harum dan alami.',
    fact: 'Kulit jeruk bisa diuraikan secara alami dan bahkan dapat diolah menjadi cairan pembersih ramah lingkungan bernama ekoenzim.',
  },
  {
    id: 'potongan-sayur',
    name: 'Potongan Sayur Bayam',
    category: 'organik',
    hint: 'Batang dan daun sayuran dari dapur.',
    fact: 'Potongan sayur cepat terurai di alam dan sangat baik dicampur ke dalam tong komposter sekolah.',
  },

  // ANORGANIK (8 items)
  {
    id: 'botol-plastik',
    name: 'Botol Plastik Minum',
    category: 'anorganik',
    hint: 'Wadah minuman bening yang bisa didaur ulang.',
    fact: 'Botol plastik butuh ratusan tahun untuk hancur di tanah, tetapi jika dipilah dengan benar bisa didaur ulang menjadi serat baju atau pot bunga!',
  },
  {
    id: 'kaleng-minuman',
    name: 'Kaleng Minuman',
    category: 'anorganik',
    hint: 'Terbuat dari logam aluminium yang bisa dilebur lagi.',
    fact: 'Kaleng aluminium dapat didaur ulang berkali-kali tanpa kehilangan kualitasnya dan menghemat banyak energi listrik pabrik.',
  },
  {
    id: 'kardus-bekas',
    name: 'Kardus Paket',
    category: 'anorganik',
    hint: 'Terbuat dari kertas tebal cokelat yang bisa dilipat.',
    fact: 'Kardus kering bisa dikumpulkan ke bank sampah untuk didaur ulang menjadi kertas baru, sehingga kita ikut menyelamatkan banyak pohon.',
  },
  {
    id: 'gelas-plastik',
    name: 'Gelas Plastik Es Teh',
    category: 'anorganik',
    hint: 'Wadah plastik bening dari kantin yang tidak membusuk.',
    fact: 'Gelas plastik tidak bisa membusuk di tanah. Kosongkan isinya dulu sebelum dimasukkan ke tempat sampah anorganik agar mudah didaur ulang.',
  },
  {
    id: 'koran-bekas',
    name: 'Kertas & Koran Bekas',
    category: 'anorganik',
    hint: 'Lembaran kertas bacaan yang sudah tidak terpakai.',
    fact: 'Kertas dan koran bekas termasuk anorganik yang bernilai di bank sampah. Satu ton kertas daur ulang bisa menyelamatkan belasan pohon!',
  },
  {
    id: 'botol-kaca',
    name: 'Botol Kaca Sirup',
    category: 'anorganik',
    hint: 'Wadah kaca bening yang tidak busuk dan bisa dilebur.',
    fact: 'Kaca tidak pernah membusuk di tanah, namun bisa dicuci, dilebur, dan dibentuk ulang menjadi botol kaca baru selamanya.',
  },
  {
    id: 'kantong-plastik',
    name: 'Kantong Plastik',
    category: 'anorganik',
    hint: 'Tas kresek ringan yang sulit hancur di alam.',
    fact: 'Kantong plastik sulit terurai dan berbahaya jika terbawa ke sungai atau laut. Membawa tas kain saat belanja sangat membantu bumi!',
  },
  {
    id: 'kotak-susu',
    name: 'Kotak Susu Kemasan',
    category: 'anorganik',
    hint: 'Kemasan minuman yang terdiri dari lapisan kertas dan aluminium.',
    fact: 'Kotak susu bekas yang sudah kosong dan dilipat rapi bisa dikirim ke pusat daur ulang untuk diubah menjadi papan atap ramah lingkungan.',
  },

  // B3 (8 items)
  {
    id: 'baterai-bekas',
    name: 'Baterai Bekas',
    category: 'b3',
    hint: 'Sumber tenaga mainan atau jam yang berisi zat kimia.',
    fact: 'Baterai bekas mengandung logam berat beracun yang dapat meresap ke tanah dan mencemari air bersih jika dibuang bersama sampah biasa.',
  },
  {
    id: 'lampu-bohlam',
    name: 'Lampu Bohlam Rusak',
    category: 'b3',
    hint: 'Benda kaca listrik yang dapat mengandung uap merkuri.',
    fact: 'Lampu neon dan bohlam tertentu mengandung zat berbahaya serta pecahan kaca tajam, sehingga harus dipisahkan di wadah B3 agar petugas aman.',
  },
  {
    id: 'obat-kedaluwarsa',
    name: 'Obat Kedaluwarsa',
    category: 'b3',
    hint: 'Tablet atau pil kesehatan yang sudah lewat tanggal pakainya.',
    fact: 'Obat kedaluwarsa tidak boleh dibuang sembarangan karena zat kimianya bisa meracuni hewan atau mencemari air tanah.',
  },
  {
    id: 'semprot-nyamuk',
    name: 'Kaleng Semprot Nyamuk',
    category: 'b3',
    hint: 'Kaleng bertekanan berisi cairan pembasmi serangga.',
    fact: 'Kaleng aerosol pembasmi serangga mengandung bahan beracun dan gas bertekanan yang bisa meledak jika terkena panas atau api.',
  },
  {
    id: 'termometer-rusak',
    name: 'Termometer Pecah',
    category: 'b3',
    hint: 'Alat pengukur suhu kaca yang berisiko mengandung raksa.',
    fact: 'Termometer air raksa yang pecah sangat berbahaya karena cairan merkuri beracun bagi saraf manusia dan tidak boleh disentuh langsung.',
  },
  {
    id: 'charger-rusak',
    name: 'Charger & Kabel Rusak',
    category: 'b3',
    hint: 'Barang elektronik bekas yang disebut e-waste.',
    fact: 'Limbah elektronik seperti charger dan kabel rusak mengandung timbal dan komponen kimia yang harus didaur ulang di fasilitas khusus B3.',
  },
  {
    id: 'masker-medis',
    name: 'Masker Medis Bekas',
    category: 'b3',
    hint: 'Penutup mulut dan hidung bekas pakai yang membawa kuman.',
    fact: 'Masker medis bekas bisa membawa virus dan bakteri, sehingga termasuk limbah infeksius B3 dan sebaiknya digunting talinya sebelum dibuang tertutup.',
  },
  {
    id: 'cairan-pembersih',
    name: 'Botol Pembersih Lantai',
    category: 'b3',
    hint: 'Wadah cairan kimia kuat pembersih kamar mandi.',
    fact: 'Sisa cairan pembersih atau pemutih bersifat korosif dan beracun bagi ikan di sungai, sehingga botolnya harus dipisahkan sebagai sampah B3.',
  },
];

export interface AppreciationTier {
  title: string;
  message: string;
  stars: 1 | 2 | 3;
}

export function getAppreciationTier(correctCount: number, totalCount: number): AppreciationTier {
  const ratio = totalCount > 0 ? correctCount / totalCount : 0;
  if (ratio >= 0.85) {
    return {
      title: 'Pahlawan Bumi Super!',
      message: 'Luar biasa! Kamu sangat teliti menjaga kebersihan sekolah dan bumi kita.',
      stars: 3,
    };
  }
  if (ratio >= 0.6) {
    return {
      title: 'Penjaga Lingkungan Hebat!',
      message: 'Bagus sekali! Sedikit lagi semua sampah di kelas pasti terpilah sempurna.',
      stars: 2,
    };
  }
  return {
    title: 'Sobat Bumi Semangat!',
    message: 'Terima kasih sudah berani maju dan belajar memilah sampah hari ini!',
    stars: 1,
  };
}
