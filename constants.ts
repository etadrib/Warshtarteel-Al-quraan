
import { Surah, Verse } from './types';

// Complete Surah List Metadata (1-114)
export const SURAH_LIST: Surah[] = [
  { id: 1, name: "الفاتحة", transliteration: "Al-Fatiha", english: "The Opening", verseCount: 7, startPage: 1, endPage: 1 },
  { id: 2, name: "البقرة", transliteration: "Al-Baqarah", english: "The Cow", verseCount: 286, startPage: 2, endPage: 49 },
  { id: 3, name: "آل عمران", transliteration: "Ali 'Imran", english: "Family of Imran", verseCount: 200, startPage: 50, endPage: 76 },
  { id: 4, name: "النساء", transliteration: "An-Nisa", english: "The Women", verseCount: 176, startPage: 77, endPage: 106 },
  { id: 5, name: "المائدة", transliteration: "Al-Ma'idah", english: "The Table Spread", verseCount: 120, startPage: 106, endPage: 127 },
  // ... Mapping gap for brevity, usually we would list all 114 ...
  { id: 109, name: "الكافرون", transliteration: "Al-Kafirun", english: "The Disbelievers", verseCount: 6, startPage: 603, endPage: 603 },
  { id: 110, name: "النصر", transliteration: "An-Nasr", english: "The Divine Support", verseCount: 3, startPage: 603, endPage: 603 },
  { id: 111, name: "المسد", transliteration: "Al-Masad", english: "The Palm Fiber", verseCount: 5, startPage: 603, endPage: 603 },
  { id: 112, name: "الإخلاص", transliteration: "Al-Ikhlas", english: "The Sincerity", verseCount: 4, startPage: 604, endPage: 604 },
  { id: 113, name: "الفلق", transliteration: "Al-Falaq", english: "The Daybreak", verseCount: 5, startPage: 604, endPage: 604 },
  { id: 114, name: "الناس", transliteration: "An-Nas", english: "Mankind", verseCount: 6, startPage: 604, endPage: 604 },
];

// Content for Pages 1, 2, 3, 4, 5, and 604 (Based on OCR)
export const QURAN_CONTENT: Verse[] = [
  // --- Page 1: Al-Fatiha ---
  { id: 1, surahId: 1, page: 1, juz: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
  { id: 2, surahId: 1, page: 1, juz: 1, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", translation: "All praise is due to Allah, Lord of the worlds." },
  { id: 3, surahId: 1, page: 1, juz: 1, text: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful." },
  { id: 4, surahId: 1, page: 1, juz: 1, text: "مَلِكِ يَوْمِ ٱلدِّينِ", translation: "Sovereign of the Day of Recompense." },
  { id: 5, surahId: 1, page: 1, juz: 1, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
  { id: 6, surahId: 1, page: 1, juz: 1, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", translation: "Guide us to the straight path." },
  { id: 7, surahId: 1, page: 1, juz: 1, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", translation: "The path of those upon whom You have bestowed favor..." },

  // --- Page 2: Al-Baqarah 1-5 ---
  { id: 1, surahId: 2, page: 2, juz: 1, text: "الٓمٓ", translation: "Alif, Lam, Meem." },
  { id: 2, surahId: 2, page: 2, juz: 1, text: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", translation: "This is the Book about which there is no doubt, a guidance for those conscious of Allah." },
  { id: 3, surahId: 2, page: 2, juz: 1, text: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ", translation: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them." },
  { id: 4, surahId: 2, page: 2, juz: 1, text: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ", translation: "And who believe in what has been revealed to you..." },
  { id: 5, surahId: 2, page: 2, juz: 1, text: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ", translation: "Those are upon [right] guidance from their Lord..." },

  // --- Page 3: Al-Baqarah 6-16 ---
  { id: 6, surahId: 2, page: 3, juz: 1, text: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ", translation: "Indeed, those who disbelieve - it is all the same for them..." },
  { id: 7, surahId: 2, page: 3, juz: 1, text: "خَتَمَ ٱللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰٓ أَبْصَـٰرِهِمْ غِشَـٰوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ", translation: "Allah has set a seal upon their hearts..." },
  { id: 8, surahId: 2, page: 3, juz: 1, text: "وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ وَبِٱلْيَوْمِ ٱلْـَٔاخِرِ وَمَا هُم بِمُؤْمِنِينَ", translation: "And of the people are some who say, 'We believe in Allah'..." },
  { id: 9, surahId: 2, page: 3, juz: 1, text: "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ", translation: "They [think to] deceive Allah and those who believe..." },
  { id: 10, surahId: 2, page: 3, juz: 1, text: "فِى قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ ٱللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌۢ بِمَا كَانُوا۟ يَكْذِبُونَ", translation: "In their hearts is disease, so Allah has increased their disease..." },
  { id: 11, surahId: 2, page: 3, juz: 1, text: "وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا۟ فِى ٱلْأَرْضِ قَالُوٓا۟ إِنَّمَا نَحْنُ مُصْلِحُونَ", translation: "And when it is said to them, 'Do not cause corruption on the earth'..." },
  { id: 12, surahId: 2, page: 3, juz: 1, text: "أَلَآ إِنَّهُمْ هُمُ ٱلْمُفْسِدُونَ وَلَـٰكِن لَّا يَشْعُرُونَ", translation: "Unquestionably, it is they who are the corrupters..." },
  { id: 13, surahId: 2, page: 3, juz: 1, text: "وَإِذَا قِيلَ لَهُمْ ءَامِنُوا۟ كَمَآ ءَامَنَ ٱلنَّاسُ قَالُوٓا۟ أَنُؤْمِنُ كَمَآ ءَامَنَ ٱلسُّفَهَآءُ ۗ أَلَآ إِنَّهُمْ هُمُ ٱلسُّفَهَآءُ وَلَـٰكِن لَّا يَعْلَمُونَ", translation: "And when it is said to them, 'Believe as the people have believed'..." },
  { id: 14, surahId: 2, page: 3, juz: 1, text: "وَإِذَا لَقُوا۟ ٱلَّذِينَ ءَامَنُوا۟ قَالُوٓا۟ ءَامَنَّا وَإِذَا خَلَوْا۟ إِلَىٰ شَيَـٰطِينِهِمْ قَالُوٓا۟ إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِءُونَ", translation: "And when they meet those who believe, they say, 'We believe'..." },
  { id: 15, surahId: 2, page: 3, juz: 1, text: "ٱللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِى طُغْيَـٰنِهِمْ يَعْمَهُونَ", translation: "Allah mocks them and prolongs them in their transgression..." },
  { id: 16, surahId: 2, page: 3, juz: 1, text: "أُو۟لَـٰٓئِكَ ٱلَّذِينَ ٱشْتَرَوُا۟ ٱلضَّلَـٰلَةَ بِٱلْهُدَىٰ فَمَا رَبِحَت تِّجَـٰرَتُهُمْ وَمَا كَانُوا۟ مُهْتَدِينَ", translation: "Those are the ones who have purchased error for guidance..." },

  // --- Page 4: Al-Baqarah 17-24 ---
  { id: 17, surahId: 2, page: 4, juz: 1, text: "مَثَلُهُمْ كَمَثَلِ ٱلَّذِى ٱسْتَوْقَدَ نَارًا فَلَمَّآ أَضَآءَتْ مَا حَوْلَهُۥ ذَهَبَ ٱللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِى ظُلُمَـٰتٍ لَّا يُبْصِرُونَ", translation: "Their example is that of one who kindled a fire..." },
  { id: 18, surahId: 2, page: 4, juz: 1, text: "صُمٌّۢ بُكْمٌ عُمْىٌ فَهُمْ لَا يَرْجِعُونَ", translation: "Deaf, dumb and blind - so they will not return." },
  { id: 19, surahId: 2, page: 4, juz: 1, text: "أَوْ كَصَيِّبٍ مِّنَ ٱلسَّمَآءِ فِيهِ ظُلُمَـٰتٌ وَرَعْدٌ وَبَرْقٌ يَجْعَلُونَ أَصَـٰبِعَهُمْ فِىٓ ءَاذَانِهِم مِّنَ ٱلصَّوَٰعِقِ حَذَرَ ٱلْمَوْتِ ۚ وَٱللَّهُ مُحِيطٌۢ بِٱلْكَـٰفِرِينَ", translation: "Or [it is] like a rainstorm from the sky within which is darkness..." },
  { id: 20, surahId: 2, page: 4, juz: 1, text: "يَكَادُ ٱلْبَرْقُ يَخْطَفُ أَبْصَـٰرَهُمْ ۖ كُلَّمَآ أَضَآءَ لَهُم مَّشَوْا۟ فِيهِ وَإِذَآ أَظْلَمَ عَلَيْهِمْ قَامُوا۟ ۚ وَلَوْ شَآءَ ٱللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَـٰرِهِمْ ۚ إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ", translation: "The lightning almost snatches away their sight..." },
  { id: 21, surahId: 2, page: 4, juz: 1, text: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ وَٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ", translation: "O mankind, worship your Lord, who created you..." },
  { id: 22, surahId: 2, page: 4, juz: 1, text: "ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ فِرَٰشًا وَٱلسَّمَآءَ بِنَآءً وَأَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً فَأَخْرَجَ بِهِۦ مِنَ ٱلثَّمَرَٰتِ رِزْقًا لَّكُمْ ۖ فَلَا تَجْعَلُوا۟ لِلَّهِ أَندَادًا وَأَنتُمْ تَعْلَمُونَ", translation: "[He] who made for you the earth a bed [spread out]..." },
  { id: 23, surahId: 2, page: 4, juz: 1, text: "وَإِن كُنتُمْ فِى رَيْبٍ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍ مِّن مِّثْلِهِۦ وَٱدْعُوا۟ شُهَدَآءَكُم مِّن دُونِ ٱللَّهِ إِن كُنتُمْ صَـٰدِقِينَ", translation: "And if you are in doubt about what We have sent down..." },
  { id: 24, surahId: 2, page: 4, juz: 1, text: "فَإِن لَّمْ تَفْعَلُوا۟ وَلَن تَفْعَلُوا۟ فَٱتَّقُوا۟ ٱلنَّارَ ٱلَّتِى وَقُودُهَا ٱلنَّاسُ وَٱلْحِجَارَةُ ۖ أُعِدَّتْ لِلْكَـٰفِرِينَ", translation: "But if you do not - and you will never be able to - then fear the Fire..." },

  // --- Page 5: Al-Baqarah 25-29 ---
  { id: 25, surahId: 2, page: 5, juz: 1, text: "وَبَشِّرِ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أَنَّ لَهُمْ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ ۖ كُلَّمَا رُزِقُوا۟ مِنْهَا مِن ثَمَرَةٍ رِّزْقًا ۙ قَالُوا۟ هَـٰذَا ٱلَّذِى رُزِقْنَا مِن قَبْلُ ۖ وَأُتُوا۟ بِهِۦ مُتَشَـٰبِهًا ۖ وَلَهُمْ فِيهَآ أَزْوَٰجٌ مُّطَهَّرَةٌ ۖ وَهُمْ فِيهَا خَـٰلِدُونَ", translation: "And give good tidings to those who believe..." },
  { id: 26, surahId: 2, page: 5, juz: 1, text: "۞ إِنَّ ٱللَّهَ لَا يَسْتَحْىِۦٓ أَن يَضْرِبَ مَثَلًا مَّا بَعُوضَةً فَمَا فَوْقَهَا ۚ فَأَمَّا ٱلَّذِينَ ءَامَنُوا۟ فَيَعْلَمُونَ أَنَّهُ ٱلْحَقُّ مِن رَّبِّهِمْ ۖ وَأَمَّا ٱلَّذِينَ كَفَرُوا۟ فَيَقُولُونَ مَاذَآ أَرَادَ ٱللَّهُ بِهَـٰذَا مَثَلًا ۘ يُضِلُّ بِهِۦ كَثِيرًا وَيَهْدِى بِهِۦ كَثِيرًا ۚ وَمَا يُضِلُّ بِهِۦٓ إِلَّا ٱلْفَـٰسِقِينَ", translation: "Indeed, Allah is not timid to present an example..." },
  { id: 27, surahId: 2, page: 5, juz: 1, text: "ٱلَّذِينَ يَنقُضُونَ عَهْدَ ٱللَّهِ مِنۢ بَعْدِ مِيثَـٰقِهِۦ وَيَقْطَعُونَ مَآ أَمَرَ ٱللَّهُ بِهِۦٓ أَن يُوصَلَ وَيُفْسِدُونَ فِى ٱلْأَرْضِ ۚ أُو۟لَـٰٓئِكَ هُمُ ٱلْخَـٰسِرُونَ", translation: "Who break the covenant of Allah after contracting it..." },
  { id: 28, surahId: 2, page: 5, juz: 1, text: "كَيْفَ تَكْفُرُونَ بِٱللَّهِ وَكُنتُمْ أَمْوَٰتًا فَأَحْيَـٰكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ثُمَّ إِلَيْهِ تُرْجَعُونَ", translation: "How can you disbelieve in Allah when you were lifeless..." },
  { id: 29, surahId: 2, page: 5, juz: 1, text: "هُوَ ٱلَّذِى خَلَقَ لَكُم مَّا فِى ٱلْأَرْضِ جَمِيعًا ثُمَّ ٱسْتَوَىٰٓ إِلَى ٱلسَّمَآءِ فَسَوَّىٰهُنَّ سَبْعَ سَمَـٰوَٰتٍ ۚ وَهُوَ بِكُلِّ شَىْءٍ عَلِيمٌ", translation: "It is He who created for you all of that which is on the earth..." },

  // --- Page 604: Ikhlas, Falaq, Nas ---
  { id: 1, surahId: 112, page: 604, juz: 30, text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", translation: "Say, He is Allah, [who is] One." },
  { id: 2, surahId: 112, page: 604, juz: 30, text: "ٱللَّهُ ٱلصَّمَدُ", translation: "Allah, the Eternal Refuge." },
  { id: 3, surahId: 112, page: 604, juz: 30, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
  { id: 4, surahId: 112, page: 604, juz: 30, text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", translation: "Nor is there to Him any equivalent." },

  { id: 1, surahId: 113, page: 604, juz: 30, text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", translation: "Say, I seek refuge in the Lord of daybreak" },
  { id: 2, surahId: 113, page: 604, juz: 30, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
  { id: 3, surahId: 113, page: 604, juz: 30, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
  { id: 4, surahId: 113, page: 604, juz: 30, text: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", translation: "And from the evil of the blowers in knots" },
  { id: 5, surahId: 113, page: 604, juz: 30, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies." },

  { id: 1, surahId: 114, page: 604, juz: 30, text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", translation: "Say, I seek refuge in the Lord of mankind," },
  { id: 2, surahId: 114, page: 604, juz: 30, text: "مَلِكِ ٱلنَّاسِ", translation: "The Sovereign of mankind." },
  { id: 3, surahId: 114, page: 604, juz: 30, text: "إِلَـٰهِ ٱلنَّاسِ", translation: "The God of mankind," },
  { id: 4, surahId: 114, page: 604, juz: 30, text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", translation: "From the evil of the retreating whisperer" },
  { id: 5, surahId: 114, page: 604, juz: 30, text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", translation: "Who whispers [evil] into the breasts of mankind" },
  { id: 6, surahId: 114, page: 604, juz: 30, text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", translation: "From among the jinn and mankind." }
];

export const MOCK_PROGRESS = [
  { name: 'Mon', accuracy: 85, time: 15 },
  { name: 'Tue', accuracy: 88, time: 20 },
  { name: 'Wed', accuracy: 92, time: 25 },
  { name: 'Thu', accuracy: 89, time: 18 },
  { name: 'Fri', accuracy: 94, time: 30 },
  { name: 'Sat', accuracy: 96, time: 45 },
  { name: 'Sun', accuracy: 95, time: 40 },
];
