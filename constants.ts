import { Surah } from './types';

export const MOCK_SURAHS: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    transliteration: "Al-Fatiha",
    english: "The Opening",
    verses: [
      { id: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", page: 1 },
      { id: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", translation: "All praise is due to Allah, Lord of the worlds.", page: 1 },
      { id: 3, text: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful.", page: 1 },
      { id: 4, text: "مَلِكِ يَوْمِ ٱلدِّينِ", translation: "Sovereign of the Day of Recompense.", page: 1 },
      { id: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help.", page: 1 },
      { id: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", translation: "Guide us to the straight path.", page: 1 },
      { id: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.", page: 1 }
    ]
  },
  {
    id: 112,
    name: "الإخلاص",
    transliteration: "Al-Ikhlas",
    english: "The Sincerity",
    verses: [
      { id: 1, text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One," , page: 604 },
      { id: 2, text: "ٱللَّهُ ٱلصَّمَدُ", translation: "Allah, the Eternal Refuge.", page: 604 },
      { id: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born,", page: 604 },
      { id: 4, text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", translation: "Nor is there to Him any equivalent.'", page: 604 }
    ]
  },
  {
    id: 113,
    name: "الفلق",
    transliteration: "Al-Falaq",
    english: "The Daybreak",
    verses: [
      { id: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak", page: 604 },
      { id: 2, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created", page: 604 },
      { id: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles", page: 604 },
      { id: 4, text: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", translation: "And from the evil of the blowers in knots", page: 604 },
      { id: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies.'", page: 604 }
    ]
  },
    {
    id: 114,
    name: "الناس",
    transliteration: "An-Nas",
    english: "Mankind",
    verses: [
      { id: 1, text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind,", page: 604 },
      { id: 2, text: "مَلِكِ ٱلنَّاسِ", translation: "The Sovereign of mankind.", page: 604 },
      { id: 3, text: "إِلَـٰهِ ٱلنَّاسِ", translation: "The God of mankind,", page: 604 },
      { id: 4, text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", translation: "From the evil of the retreating whisperer", page: 604 },
      { id: 5, text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", translation: "Who whispers [evil] into the breasts of mankind", page: 604 },
      { id: 6, text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", translation: "From among the jinn and mankind.'", page: 604 }
    ]
  }
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
