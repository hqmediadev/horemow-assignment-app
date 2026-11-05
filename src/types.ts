export type RoleMode = 'pastor' | 'leader' | 'men' | 'women' | 'youth' | 'member';

export type DisplayTheme = 'light' | 'dark' | 'sepia';

export type ConferenceType = 'women' | 'ministers' | 'youth' | 'december' | 'annual';

export interface ConferenceTarget {
  id: ConferenceType;
  name: string; // e.g. "Women Conference", "Ministers Conference", "Youth Conference", "December (General) Conference", "Annual Goal"
  active: boolean;
  targetMessages: number;
  targetBooks: number;
  targetPrayerHours: number;
  targetFastingDays: number;
  targetSouls: number;
  requiredBibleBooks: string[]; // List of Bible book names e.g. ["Genesis", "Exodus", "Matthew"]
  requiredBookIds: string[]; // List of HOREMOW book IDs
}

export interface BibleChapterState {
  book: string;
  chapter: number;
  read: boolean;
  dateRead?: string;
  notes?: string;
}

export interface BiblePlan {
  id: string;
  name: string;
  description: string;
  targetGroup: string;
  books: { book: string; totalChapters: number }[];
  totalChapters: number;
}

export interface HoremowBook {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  totalPages: number;
  pagesRead: number;
  status: 'not_started' | 'reading' | 'completed';
  summary: string;
  notes?: string;
  keyTakeaways?: string[];
  conferenceTag?: ConferenceType;
}

export interface SermonMessage {
  id: string;
  title: string;
  speaker: string;
  dateListened: string;
  durationMinutes?: number;
  keyScripture?: string;
  revelationNotes?: string;
  tags?: string[];
  conferenceTag?: ConferenceType;
}

export interface SoulWonRecord {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  dateWon: string;
  status: 'new_convert' | 'followed_up' | 'attending_fellowship' | 'established';
  conferenceInvited: boolean;
  conferenceTag?: ConferenceType;
  notes?: string;
}

export interface PrayerSession {
  id: string;
  date: string;
  durationMinutes: number;
  focusTopic: string;
  conferenceTag?: ConferenceType;
  notes?: string;
}

export interface FastingRecord {
  id: string;
  date: string;
  type: 'full' | '6am_6pm' | 'dry';
  purpose: string;
  conferenceTag?: ConferenceType;
  notes?: string;
}

export interface RoleTargetConfig {
  roleName: string;
  description: string;
  targetSermons: number;
  targetBooks: number;
  targetSouls: number;
  dailyPrayerMinutes: number;
  monthlyFastingDays: number;
  biblePlanIds: string[];
}

export interface UserProfile {
  fullName: string;
  memberId: string;
  country: string;
  stateChapter: string;
  zoneRegion: string;
  lgaDistrict?: string;
  branchFellowship?: string;
  assignmentYear: number;
  coordinatorName: string;
}

export interface UserAssignmentState {
  profile: UserProfile;
  roleMode: RoleMode;
  theme: DisplayTheme;
  activeConference: ConferenceType;
  conferenceTargets: Record<ConferenceType, ConferenceTarget>;
  bibleChapters: Record<string, boolean>; // key format "Book-Chapter" e.g. "Joshua-1"
  bibleNotes: Record<string, string>;
  books: HoremowBook[];
  sermons: SermonMessage[];
  soulsWon: SoulWonRecord[];
  prayerSessions: PrayerSession[];
  fastingRecords: FastingRecord[];
  lastUpdated: string;
}
