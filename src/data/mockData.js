export const mockUsers = [
  {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    university: '東京大学',
    year: '4年',
    major: '経済学部',
    targetIndustries: ['金融', 'コンサルティング'],
    gdExperience: 'advanced',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    university: '慶応大学',
    year: '3年',
    major: '商学部',
    targetIndustries: ['IT', 'メディア'],
    gdExperience: 'intermediate',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: '山田次郎',
    email: 'yamada@example.com',
    university: '早稲田大学',
    year: '4年',
    major: '法学部',
    targetIndustries: ['法律', '公務'],
    gdExperience: 'beginner',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2024-01-28'
  }
];

export const mockSessions = [
  {
    id: '1',
    title: '金融業界志望者向けGD',
    description: '投資銀行やコンサルティング業界を目指す学生同士でのグループディスカッション練習です。',
    theme: '新規事業立案',
    difficulty: 'advanced',
    maxParticipants: 6,
    currentParticipants: 4,
    participants: [mockUsers[0], mockUsers[1]],
    organizer: mockUsers[0],
    scheduledAt: '2024-12-25T14:00:00Z',
    duration: 90,
    location: 'online',
    zoomLink: 'https://zoom.us/j/123456789',
    status: 'recruiting',
    tags: ['金融', 'コンサル', '新規事業'],
    requirements: ['業界研究済み', 'TOEIC700点以上'],
    createdAt: '2024-12-01'
  },
  {
    id: '2',
    title: 'IT業界初心者歓迎GD',
    description: 'IT業界に興味がある初心者向けのグループディスカッション。基礎から学べます。',
    theme: 'DX推進について',
    difficulty: 'beginner',
    maxParticipants: 8,
    currentParticipants: 3,
    participants: [mockUsers[1], mockUsers[2]],
    organizer: mockUsers[1],
    scheduledAt: '2024-12-30T10:00:00Z',
    duration: 60,
    location: 'online',
    zoomLink: 'https://zoom.us/j/987654321',
    status: 'recruiting',
    tags: ['IT', 'DX', '初心者向け'],
    requirements: ['やる気があること'],
    createdAt: '2024-12-05'
  },
  {
    id: '3',
    title: '商社業界研究GD',
    description: '総合商社・専門商社を志望する方向けの実践的なグループディスカッション。',
    theme: '海外展開戦略',
    difficulty: 'intermediate',
    maxParticipants: 6,
    currentParticipants: 6,
    participants: mockUsers,
    organizer: mockUsers[2],
    scheduledAt: '2024-12-28T16:00:00Z',
    duration: 120,
    location: 'offline',
    venue: '渋谷駅前会議室A',
    status: 'full',
    tags: ['商社', '海外展開', '戦略'],
    requirements: ['商社業界研究済み', '英語力中級以上'],
    createdAt: '2024-11-28'
  },
  {
    id: '4',
    title: 'メディア業界志望者向けGD',
    description: 'テレビ局、出版社、広告代理店を目指す方向けのグループディスカッション。',
    theme: 'デジタルメディアの未来',
    difficulty: 'intermediate',
    maxParticipants: 6,
    currentParticipants: 2,
    participants: [],
    organizer: mockUsers[0],
    scheduledAt: '2024-12-27T15:00:00Z',
    duration: 90,
    location: 'online',
    zoomLink: 'https://zoom.us/j/555666777',
    status: 'recruiting',
    tags: ['メディア', 'デジタル', 'コンテンツ'],
    requirements: ['メディア業界に興味があること'],
    createdAt: '2024-12-12'
  },
  {
    id: '5',
    title: '製造業界DX推進GD',
    description: '製造業のデジタル変革について議論するグループディスカッション。',
    theme: '工場のIoT化と効率化',
    difficulty: 'advanced',
    maxParticipants: 5,
    currentParticipants: 1,
    participants: [],
    organizer: mockUsers[1],
    scheduledAt: '2024-12-29T13:00:00Z',
    duration: 120,
    location: 'online',
    zoomLink: 'https://zoom.us/j/888999000',
    status: 'recruiting',
    tags: ['製造業', 'IoT', 'DX', '効率化'],
    requirements: ['製造業界研究済み', '技術的知識があること'],
    createdAt: '2024-12-13'
  }
];

export const mockNotifications = [
  {
    id: '1',
    userId: '1',
    type: 'session_invite',
    title: '新しいGDセッションに招待されました',
    message: '「IT業界初心者歓迎GD」に参加しませんか？',
    read: false,
    createdAt: '2024-03-10T09:00:00Z',
    actionUrl: '/sessions/2'
  },
  {
    id: '2',
    userId: '1',
    type: 'evaluation_received',
    title: '評価を受け取りました',
    message: '前回のGDセッションの評価が届きました。',
    read: false,
    createdAt: '2024-03-09T18:30:00Z',
    actionUrl: '/evaluations'
  },
  {
    id: '3',
    userId: '1',
    type: 'session_reminder',
    title: 'GDセッション開始まで1時間',
    message: '「金融業界志望者向けGD」の開始まで1時間です。',
    read: true,
    createdAt: '2024-03-08T13:00:00Z'
  }
];

export const currentUser = mockUsers[0];