import { HoremowBook, BiblePlan, RoleMode, RoleTargetConfig, SermonMessage, SoulWonRecord, PrayerSession, FastingRecord, UserProfile, UserAssignmentState, ConferenceType, ConferenceTarget } from '../types';

export const ROLE_CONFIGS: Record<RoleMode, RoleTargetConfig> = {
  pastor: {
    roleName: "Ministers & Pastors",
    description: "Full ministerial mandate: intensive sermon messages, comprehensive Bible study with commentary, deep soul winning & leadership oversight.",
    targetSermons: 120,
    targetBooks: 8,
    targetSouls: 50,
    dailyPrayerMinutes: 90,
    monthlyFastingDays: 4,
    biblePlanIds: ['joshua_2kings', 'hosea_zephaniah', 'new_testament'],
  },
  leader: {
    roleName: "State & Regional Leaders",
    description: "Leadership mandate: regular message study, Bible plans with commentaries, soul winning & regional coordination.",
    targetSermons: 80,
    targetBooks: 6,
    targetSouls: 30,
    dailyPrayerMinutes: 60,
    monthlyFastingDays: 3,
    biblePlanIds: ['joshua_ruth', 'hosea_zephaniah', 'epistles'],
  },
  men: {
    roleName: "Men Fellowship",
    description: "Spiritual headship mandate: message listening, family & personal holiness books, active soul winning and family prayer.",
    targetSermons: 50,
    targetBooks: 5,
    targetSouls: 15,
    dailyPrayerMinutes: 60,
    monthlyFastingDays: 2,
    biblePlanIds: ['joshua_ruth', 'epistles'],
  },
  women: {
    roleName: "Women Fellowship",
    description: "Virtuous woman mandate: message listening, Christian home & restitution books, soul winning & intercession.",
    targetSermons: 50,
    targetBooks: 5,
    targetSouls: 15,
    dailyPrayerMinutes: 60,
    monthlyFastingDays: 2,
    biblePlanIds: ['joshua_ruth', 'epistles'],
  },
  youth: {
    roleName: "Youth & Campus Fellowship",
    description: "Youth holiness mandate: message listening, avoiding youth lusts & financial danger books, campus soul winning.",
    targetSermons: 40,
    targetBooks: 4,
    targetSouls: 10,
    dailyPrayerMinutes: 45,
    monthlyFastingDays: 2,
    biblePlanIds: ['joshua_ruth', 'gospels_acts'],
  },
  member: {
    roleName: "General Member / Delegate",
    description: "General holiness mandate: foundational message listening, core holiness books, soul winning & regular fellowship.",
    targetSermons: 30,
    targetBooks: 3,
    targetSouls: 5,
    dailyPrayerMinutes: 40,
    monthlyFastingDays: 2,
    biblePlanIds: ['joshua_ruth'],
  },
};

export const INITIAL_CONFERENCES: Record<ConferenceType, ConferenceTarget> = {
  annual: {
    id: 'annual',
    name: 'Annual General Cycle',
    active: true,
    targetMessages: 80,
    targetBooks: 6,
    targetPrayerHours: 120,
    targetFastingDays: 24,
    targetSouls: 20,
    requiredBibleBooks: ['Joshua', 'Judges', 'Ruth', 'Matthew', 'Romans'],
    requiredBookIds: ['b1', 'b2', 'b3', 'b4'],
  },
  women: {
    id: 'women',
    name: 'Women Conference',
    active: false,
    targetMessages: 20,
    targetBooks: 3,
    targetPrayerHours: 30,
    targetFastingDays: 6,
    targetSouls: 10,
    requiredBibleBooks: ['Ruth', 'Esther', 'Proverbs', 'Titus'],
    requiredBookIds: ['b6', 'b1', 'b3'],
  },
  ministers: {
    id: 'ministers',
    name: 'Ministers Conference',
    active: false,
    targetMessages: 35,
    targetBooks: 4,
    targetPrayerHours: 50,
    targetFastingDays: 10,
    targetSouls: 15,
    requiredBibleBooks: ['1 Timothy', '2 Timothy', 'Titus', 'Acts', 'Hosea'],
    requiredBookIds: ['b1', 'b2', 'b5', 'b7'],
  },
  youth: {
    id: 'youth',
    name: 'Youth Conference',
    active: false,
    targetMessages: 25,
    targetBooks: 3,
    targetPrayerHours: 35,
    targetFastingDays: 7,
    targetSouls: 12,
    requiredBibleBooks: ['Daniel', 'Ecclesiastes', '1 John', 'Romans'],
    requiredBookIds: ['b2', 'b4', 'b8'],
  },
  december: {
    id: 'december',
    name: 'December (General) Conference',
    active: false,
    targetMessages: 40,
    targetBooks: 5,
    targetPrayerHours: 60,
    targetFastingDays: 12,
    targetSouls: 25,
    requiredBibleBooks: ['Joshua', 'Judges', 'Ruth', 'Revelation', 'Hebrews'],
    requiredBookIds: ['b1', 'b2', 'b3', 'b4', 'b8'],
  },
};

export const INITIAL_PROFILE: UserProfile = {
  fullName: "Bro. Emmanuel Okonkwo",
  memberId: "HOREMOW-2026-8842",
  country: "Nigeria",
  stateChapter: "Lagos Central Chapter",
  zoneRegion: "South-West Zone 1",
  lgaDistrict: "Ikeja LGA District",
  branchFellowship: "Ikeja Central HQ Fellowship",
  assignmentYear: 2026,
  coordinatorName: "Pastor John Adeleke",
};

export const BIBLE_PLANS: BiblePlan[] = [
  {
    id: 'joshua_ruth',
    name: 'Historical Books (Joshua to Ruth)',
    description: 'Covers God\'s faithfulness, conquests, holiness in leadership, and divine redemption.',
    targetGroup: 'General Assignment (All Members)',
    books: [
      { book: 'Joshua', totalChapters: 24 },
      { book: 'Judges', totalChapters: 21 },
      { book: 'Ruth', totalChapters: 4 },
    ],
    totalChapters: 49,
  },
  {
    id: 'hosea_zephaniah',
    name: 'Minor Prophets (Hosea to Zephaniah)',
    description: 'Covers prophetic warnings against idolatry, calls to true repentance, and God\'s mercy.',
    targetGroup: 'Leaders, Ministers & Pastors',
    books: [
      { book: 'Hosea', totalChapters: 14 },
      { book: 'Joel', totalChapters: 3 },
      { book: 'Amos', totalChapters: 9 },
      { book: 'Obadiah', totalChapters: 1 },
      { book: 'Jonah', totalChapters: 4 },
      { book: 'Micah', totalChapters: 7 },
      { book: 'Nahum', totalChapters: 3 },
      { book: 'Habakkuk', totalChapters: 3 },
      { book: 'Zephaniah', totalChapters: 3 },
    ],
    totalChapters: 47,
  },
  {
    id: 'gospels_acts',
    name: 'Gospels & Acts of Apostles',
    description: 'The life and teachings of Jesus Christ, the power of the Holy Spirit, and apostolic soul winning.',
    targetGroup: 'Youth & New Converts',
    books: [
      { book: 'Matthew', totalChapters: 28 },
      { book: 'Mark', totalChapters: 16 },
      { book: 'Luke', totalChapters: 24 },
      { book: 'John', totalChapters: 21 },
      { book: 'Acts', totalChapters: 28 },
    ],
    totalChapters: 117,
  },
  {
    id: 'epistles',
    name: 'New Testament Epistles',
    description: 'Doctrine of true righteousness, holiness, church discipline, and Christian living.',
    targetGroup: 'Leaders & Fellowships',
    books: [
      { book: 'Romans', totalChapters: 16 },
      { book: '1 Corinthians', totalChapters: 16 },
      { book: '2 Corinthians', totalChapters: 13 },
      { book: 'Galatians', totalChapters: 6 },
      { book: 'Ephesians', totalChapters: 6 },
      { book: 'Philippians', totalChapters: 4 },
      { book: 'Colossians', totalChapters: 4 },
      { book: '1 Thessalonians', totalChapters: 5 },
      { book: '2 Thessalonians', totalChapters: 3 },
      { book: '1 Timothy', totalChapters: 6 },
      { book: '2 Timothy', totalChapters: 4 },
      { book: 'Titus', totalChapters: 3 },
      { book: 'Philemon', totalChapters: 1 },
      { book: 'Hebrews', totalChapters: 13 },
      { book: 'James', totalChapters: 5 },
      { book: '1 Peter', totalChapters: 5 },
      { book: '2 Peter', totalChapters: 3 },
      { book: '1 John', totalChapters: 5 },
      { book: '2 John', totalChapters: 1 },
      { book: '3 John', totalChapters: 1 },
      { book: 'Jude', totalChapters: 1 },
      { book: 'Revelation', totalChapters: 22 },
    ],
    totalChapters: 168,
  },
];

export const INITIAL_BOOKS: HoremowBook[] = [
  {
    id: 'b1',
    title: 'Eradicating Sin in the Church & Society',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-emerald-700 text-white',
    totalPages: 180,
    pagesRead: 180,
    status: 'completed',
    summary: 'A deep biblical treatise on exposing hidden sins, hypocritical living, and restoring uncompromised purity in the Body of Christ.',
    notes: 'Finished reading all 12 chapters. Key emphasis on secret sins and heart purity.',
    keyTakeaways: [
      'Sin cannot be masked by religious activity.',
      'True repentance involves confession and abandonment of evil.',
      'Holiness is mandatory for seeing the Lord.'
    ],
    conferenceTag: 'annual'
  },
  {
    id: 'b2',
    title: 'Escape for Your Life',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-red-700 text-white',
    totalPages: 210,
    pagesRead: 140,
    status: 'reading',
    summary: 'An urgent trumpet call warning believers against lukewarmness, worldly compromises, and preparing for the imminent Rapture.',
    notes: 'Currently in Chapter 8 reading about Lot\'s wife and worldly attachments.',
    keyTakeaways: [
      'Do not look back at Sodom\'s attractions.',
      'Keep your spiritual garments unstained.'
    ],
    conferenceTag: 'youth'
  },
  {
    id: 'b3',
    title: 'Restitution: The Divine Command',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-indigo-700 text-white',
    totalPages: 150,
    pagesRead: 150,
    status: 'completed',
    summary: 'Detailed scriptural guidelines on making wrongs right, returning stolen property, correcting false records, and clearing conscience before God and man.',
    notes: 'Completed. Reviewed restitution procedures for former workplace records.',
    keyTakeaways: [
      'A clear conscience gives confidence in prayer.',
      'Restitution proves genuine repentance.'
    ],
    conferenceTag: 'december'
  },
  {
    id: 'b4',
    title: 'The Danger of Money and Worldly Wealth',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-amber-700 text-white',
    totalPages: 165,
    pagesRead: 60,
    status: 'reading',
    summary: 'Warning against greed, corrupt enrichment, deceptive prosperity gospel, and maintaining contentment with godliness.',
    notes: 'Reading chapter 4 on contentment.',
    keyTakeaways: [
      'The love of money is the root of all evil.',
      'Seek first the Kingdom of God.'
    ],
    conferenceTag: 'youth'
  },
  {
    id: 'b5',
    title: 'Evangelism & Personal Soul Winning',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-blue-700 text-white',
    totalPages: 195,
    pagesRead: 0,
    status: 'not_started',
    summary: 'Practical strategies for effective gospel tract distribution, street preaching, follow-up, and nurturing new converts.',
    keyTakeaways: [],
    conferenceTag: 'ministers'
  },
  {
    id: 'b6',
    title: 'Marriage & Building a Christian Home',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-rose-700 text-white',
    totalPages: 220,
    pagesRead: 0,
    status: 'not_started',
    summary: 'Scriptural foundations for godly courting, marital fidelity, training holy children, and resolving marital disputes.',
    keyTakeaways: [],
    conferenceTag: 'women'
  },
  {
    id: 'b7',
    title: 'The Power of Prevailing Prayer',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-purple-700 text-white',
    totalPages: 140,
    pagesRead: 0,
    status: 'not_started',
    summary: 'How to cultivate a disciplined daily prayer life, fasting with clean hands, and obtaining answers from heaven.',
    keyTakeaways: [],
    conferenceTag: 'ministers'
  },
  {
    id: 'b8',
    title: 'Holiness & Righteousness in Daily Life',
    author: 'Pastor Paul Rika',
    coverColor: 'bg-teal-700 text-white',
    totalPages: 175,
    pagesRead: 0,
    status: 'not_started',
    summary: 'Practical application of biblical holiness in speech, dress code, business integrity, and personal conduct.',
    keyTakeaways: [],
    conferenceTag: 'december'
  }
];

export const INITIAL_SERMONS: SermonMessage[] = [
  {
    id: 's1',
    title: 'The Uncompromised Standard of True Holiness',
    speaker: 'Pastor Paul Rika',
    dateListened: '2026-08-01',
    durationMinutes: 75,
    keyScripture: 'Hebrews 12:14, 1 Peter 1:15-16',
    revelationNotes: 'Emphasized that holiness is not an option or denominational tradition, but God\'s eternal command.',
    tags: ['Holiness', 'Rapture Readiness'],
    conferenceTag: 'annual'
  },
  {
    id: 's2',
    title: 'Exposing Secret Sins & Double Living',
    speaker: 'Pastor Paul Rika',
    dateListened: '2026-08-03',
    durationMinutes: 90,
    keyScripture: 'Proverbs 28:13, Psalm 90:8',
    revelationNotes: 'God sees all hidden motives and actions. He who covers his sin shall not prosper.',
    tags: ['Repentance', 'Purity'],
    conferenceTag: 'youth'
  },
  {
    id: 's3',
    title: 'Restitution as a Proof of Genuine Salvation',
    speaker: 'Pastor Paul Rika',
    dateListened: '2026-08-05',
    durationMinutes: 80,
    keyScripture: 'Luke 19:8-9, Exodus 22:1',
    revelationNotes: 'Zacchaeus restored fourfold immediately upon salvation. Salvation brings restitution.',
    tags: ['Restitution', 'Doctrine'],
    conferenceTag: 'december'
  },
  {
    id: 's4',
    title: 'Urgency of Soul Winning in the Last Days',
    speaker: 'Pastor Paul Rika',
    dateListened: '2026-08-07',
    durationMinutes: 65,
    keyScripture: 'Ezekiel 3:17-18, Proverbs 11:30',
    revelationNotes: 'The blood of the lost will be required at our hands if we remain silent.',
    tags: ['Evangelism', 'Soul Winning'],
    conferenceTag: 'ministers'
  },
  {
    id: 's5',
    title: 'Overcoming the Love of Money in the End Time',
    speaker: 'Pastor Paul Rika',
    dateListened: '2026-08-09',
    durationMinutes: 70,
    keyScripture: '1 Timothy 6:6-10, Matthew 6:24',
    revelationNotes: 'Warning ministers and members against compromise for financial gains.',
    tags: ['Money', 'Contentment'],
    conferenceTag: 'youth'
  }
];

export const INITIAL_SOULS: SoulWonRecord[] = [
  {
    id: 'w1',
    name: 'Brother Samuel Adebayo',
    phone: '+234 803 123 4567',
    location: 'Ikeja, Lagos',
    dateWon: '2026-07-15',
    status: 'attending_fellowship',
    conferenceInvited: true,
    conferenceTag: 'annual',
    notes: 'Saved during street evangelism outreach. Attends weekly Tuesday Bible study.'
  },
  {
    id: 'w2',
    name: 'Sister Mary Joseph',
    phone: '+234 812 987 6543',
    location: 'Yaba, Lagos',
    dateWon: '2026-07-28',
    status: 'followed_up',
    conferenceInvited: true,
    conferenceTag: 'women',
    notes: 'Given HOREMOW gospel tracts and book on Restitution. Responding well.'
  },
  {
    id: 'w3',
    name: 'Brother David Chen',
    phone: '+234 701 555 0192',
    location: 'Victoria Island, Lagos',
    dateWon: '2026-08-02',
    status: 'new_convert',
    conferenceInvited: false,
    conferenceTag: 'youth',
    notes: 'Met at campus outreach. Prayed prayer of salvation. Scheduled follow-up visit.'
  }
];

export const INITIAL_PRAYERS: PrayerSession[] = [
  {
    id: 'p1',
    date: '2026-08-08',
    durationMinutes: 60,
    focusTopic: 'Intercession for World Evangelism & HOREMOW Global Conference',
    conferenceTag: 'annual',
    notes: 'Prayed for sinners to be saved and for boldness in street witnessing.'
  },
  {
    id: 'p2',
    date: '2026-08-09',
    durationMinutes: 75,
    focusTopic: 'Personal Heart Purity & Rapture Readiness',
    conferenceTag: 'youth',
    notes: 'Quiet time prayer seeking grace to walk worthy of the Lord.'
  },
  {
    id: 'p3',
    date: '2026-08-10',
    durationMinutes: 60,
    focusTopic: 'Ministers, Leaders & Persecuted Believers Worldwide',
    conferenceTag: 'ministers',
    notes: 'Fervent prayer session with Scripture reading from Psalm 91.'
  }
];

export const INITIAL_FASTINGS: FastingRecord[] = [
  {
    id: 'f1',
    date: '2026-08-01',
    type: '6am_6pm',
    purpose: 'Monthly HOREMOW Worldwide Fasting & Prayer Day',
    conferenceTag: 'annual',
    notes: 'Broken with light food and praise at 6:00 PM.'
  },
  {
    id: 'f2',
    date: '2026-08-08',
    type: '6am_6pm',
    purpose: 'Personal consecration & soul winning unction',
    conferenceTag: 'youth',
    notes: 'Spent afternoon hours reading Scriptures and praying.'
  }
];

export function createInitialMemberState(profile: Pick<UserProfile, 'fullName' | 'country' | 'stateChapter' | 'zoneRegion' | 'lgaDistrict' | 'branchFellowship'>): UserAssignmentState {
  const conferenceTargets = Object.fromEntries(
    (Object.entries(INITIAL_CONFERENCES) as [ConferenceType, ConferenceTarget][]).map(([conference, target]) => [
      conference,
      {
        ...target,
        requiredBibleBooks: [...target.requiredBibleBooks],
        requiredBookIds: [...target.requiredBookIds],
      },
    ]),
  ) as Record<ConferenceType, ConferenceTarget>;

  return {
    profile: {
      fullName: profile.fullName,
      memberId: '',
      country: profile.country,
      stateChapter: profile.stateChapter,
      zoneRegion: profile.zoneRegion,
      lgaDistrict: profile.lgaDistrict,
      branchFellowship: profile.branchFellowship,
      assignmentYear: new Date().getFullYear(),
      coordinatorName: '',
    },
    roleMode: 'member',
    theme: 'light',
    activeConference: 'annual',
    conferenceTargets,
    bibleChapters: {},
    bibleNotes: {},
    books: INITIAL_BOOKS.map((book) => {
      const cleanBook = { ...book };
      delete cleanBook.notes;
      return {
        ...cleanBook,
        pagesRead: 0,
        status: 'not_started',
        keyTakeaways: [],
      };
    }),
    sermons: [],
    soulsWon: [],
    prayerSessions: [],
    fastingRecords: [],
    lastUpdated: new Date().toISOString(),
  };
}
