import type { Ticket, TriageResponse } from '@/types/api';

// ─── Demo Triage Responses ──────────────────────────────────────────────────

const demoTriageResponses: Record<string, TriageResponse> = {
  'TKT-001': {
    ticket_id: 'TKT-001',
    category: 'complaint.insult',
    priority: 'p2',
    rule_refs: ['2.1', '2.3'],
    verdict: 'approved',
    punishment_suggestion: 'Warning issued. Temporary chat restriction (24h).',
    draft:
      'Dear Player, thank you for reporting this issue. We have reviewed the complaint and confirmed the violation of Rule 2.1 (Abusive Language). A warning has been issued to the offending player, along with a 24-hour chat restriction. We take such matters seriously to ensure a safe gaming environment.',
    needs_human: false,
    confidence: 0.92,
  },
  'TKT-002': {
    ticket_id: 'TKT-002',
    category: 'complaint.cheating',
    priority: 'p1',
    rule_refs: ['5.1'],
    verdict: 'escalated',
    punishment_suggestion: null,
    draft:
      'Уважаемый игрок, мы получили вашу жалобу и передали дело специалисту для детального рассмотрения. Команда безопасности проведёт дополнительное расследование. Мы сообщим вам о результатах.',
    needs_human: true,
    confidence: 0.65,
  },
  'TKT-003': {
    ticket_id: 'TKT-003',
    category: 'complaint.scam',
    priority: 'p1',
    rule_refs: ['4.2', '4.5'],
    verdict: 'approved',
    punishment_suggestion: 'Permanent ban pending investigation review.',
    draft:
      'Құрметті ойыншы, сіздің шағымыңыз қабылданды. Біз алаяқтық әрекеттерді анықтадық және тиісті шаралар қолданылды. Ойын ішіндегі заттарыңызды қалпына келтіру мәселесі қарастырылуда.',
    needs_human: false,
    confidence: 0.88,
  },
  'TKT-004': {
    ticket_id: 'TKT-004',
    category: 'complaint.bug',
    priority: 'p3',
    rule_refs: [],
    verdict: 'approved',
    punishment_suggestion: null,
    draft:
      'Thank you for reporting this bug. Our development team has been notified and will investigate the issue. We appreciate your patience while we work on a fix.',
    needs_human: false,
    confidence: 0.95,
  },
  'TKT-005': {
    ticket_id: 'TKT-005',
    category: 'complaint.payment',
    priority: 'p2',
    rule_refs: ['7.1'],
    verdict: 'escalated',
    punishment_suggestion: null,
    draft:
      'Здравствуйте! Мы получили вашу жалобу по поводу оплаты. Данный вопрос требует рассмотрения финансовым отделом. Ваше обращение передано специалисту.',
    needs_human: true,
    confidence: 0.72,
  },
  'TKT-006': {
    ticket_id: 'TKT-006',
    category: 'complaint.harassment',
    priority: 'p1',
    rule_refs: ['2.1', '2.4', '3.1'],
    verdict: 'approved',
    punishment_suggestion: '3-day account suspension.',
    draft:
      'Dear Player, we have thoroughly reviewed the reported harassment incident. Multiple rule violations have been confirmed. Appropriate disciplinary action has been taken against the offending player. Please do not hesitate to report any further incidents.',
    needs_human: false,
    confidence: 0.91,
  },
};

// ─── Demo Tickets ───────────────────────────────────────────────────────────

export const demoTickets: Ticket[] = [
  {
    id: 'TKT-001',
    complaint:
      'This player called me terrible names in chat during our match. They used very offensive language and kept insulting my team. This is unacceptable behavior and I want them punished.',
    player_id: 'PLR-44821',
    language: 'en',
    status: 'new',
    created_at: '2026-10-30T08:12:00Z',
    updated_at: '2026-10-30T08:12:45Z',
  },
  {
    id: 'TKT-002',
    complaint:
      'Этот игрок использует читы в игре. Он стреляет через стены и всегда знает где я нахожусь. Прошу проверить его аккаунт и принять меры. Это происходит уже несколько дней.',
    player_id: 'PLR-19203',
    language: 'ru',
    status: 'new',
    created_at: '2026-10-30T07:45:00Z',
    updated_at: '2026-10-30T07:46:30Z',
  },
  {
    id: 'TKT-003',
    complaint:
      'Бір ойыншы маған алаяқтық жасады. Ол маған жалған сауда ұсынды және менің заттарымды алып кетті. Ойын ішінде заттарымды қайтаруды сұраймын. Оның аты: DarkTrader99.',
    player_id: 'PLR-77512',
    language: 'kk',
    status: 'new',
    created_at: '2026-10-30T06:30:00Z',
    updated_at: '2026-10-30T06:31:15Z',
  },
  {
    id: 'TKT-004',
    complaint:
      'The game crashes every time I try to enter the arena mode. I have tried reinstalling but the problem persists. My device is Samsung Galaxy S24. Please fix this.',
    player_id: 'PLR-33105',
    language: 'en',
    status: 'new',
    created_at: '2026-10-30T05:20:00Z',
    updated_at: '2026-10-30T05:20:30Z',
  },
  {
    id: 'TKT-005',
    complaint:
      'Я совершил покупку в игре, но предметы не были получены. Деньги списались с карты. Номер транзакции: TXN-2026-88431. Прошу вернуть деньги или выдать купленные предметы.',
    player_id: 'PLR-60298',
    language: 'ru',
    status: 'new',
    created_at: '2026-10-29T22:10:00Z',
    updated_at: '2026-10-29T22:11:00Z',
  },
  {
    id: 'TKT-006',
    complaint:
      'A player has been following me around in every game, sending me threatening messages, and telling other players to target me. This has been going on for a week. Player name: ShadowHunter. I have screenshots.',
    player_id: 'PLR-15487',
    language: 'en',
    status: 'new',
    created_at: '2026-10-29T20:00:00Z',
    updated_at: '2026-10-29T20:01:30Z',
  },
  {
    id: 'TKT-007',
    complaint:
      'Ойынға кіре алмаймын. Серверге қосылу мүмкін емес деп жазады. Бұл мәселе бүгін бастап пайда болды. Интернет байланысым жақсы жұмыс істейді.',
    player_id: 'PLR-41009',
    language: 'kk',
    status: 'new',
    created_at: '2026-10-30T09:00:00Z',
    updated_at: '2026-10-30T09:00:00Z',
  },
  {
    id: 'TKT-008',
    complaint:
      'Мой аккаунт был заблокирован без причины. Я ничего не нарушал. Прошу разблокировать и объяснить причину блокировки. Мой ник: ProPlayer2026.',
    player_id: 'PLR-88732',
    language: 'ru',
    status: 'new',
    created_at: '2026-10-30T09:15:00Z',
    updated_at: '2026-10-30T09:15:00Z',
  },
];

// ─── Sample Complaints for AI Playground ────────────────────────────────────

export const sampleComplaints = [
  {
    label: '🇬🇧 Insult Report (English)',
    complaint:
      'Player "xDarkLord" called me racial slurs and kept harassing me for the entire match. I have screenshots of the chat log.',
    language: 'en',
    ruleHint: '2.4',
  },
  {
    label: '🇷🇺 Читерство (Русский)',
    complaint:
      'Игрок "FastShooter" явно использует аим-бот. Он попадает в голову каждый раз, даже не целясь. Проверьте его статистику и забаньте.',
    language: 'ru',
    ruleHint: '5.2',
  },
  {
    label: '🇰🇿 Алаяқтық (Қазақша)',
    complaint:
      'Менің ойын аккаунтымды біреу бұзып кірді. Барлық заттарымды ұрлап кетті. Көмектесіңіздер, аккаунтымды қалпына келтіруді сұраймын.',
    language: 'kk',
    ruleHint: '4.1',
  },
  {
    label: '🇺🇿 Shikoyat (O\'zbekcha)',
    complaint:
      'O\'yinda bir o\'yinchi pul talab qildi va meni aldadi. U menga yolg\'on savdo taklif qildi va buyumlarimni olib ketdi. Iltimos, tekshiring.',
    language: 'uz',
    ruleHint: '4.1',
  },
  {
    label: '🇷🇺 Оплата (Русский)',
    complaint:
      'Я купил боевой пропуск за 990 тенге, но он не активировался. Деньги списались с карты. Номер транзакции: TXN-2026-55192.',
    language: 'ru',
    ruleHint: '7.1',
  },
  {
    label: '🇬🇧 Bug Report (English)',
    complaint:
      'Game freezes on loading screen after the latest update. Device: iPhone 15 Pro, iOS 18.1. Already tried clearing cache and reinstalling.',
    language: 'en',
    ruleHint: '',
  },
];

// ─── Demo Analytics Data ────────────────────────────────────────────────────

export const demoAnalyticsData = {
  ticketVolume: [
    { date: 'Mon', tickets: 12 },
    { date: 'Tue', tickets: 18 },
    { date: 'Wed', tickets: 15 },
    { date: 'Thu', tickets: 22 },
    { date: 'Fri', tickets: 28 },
    { date: 'Sat', tickets: 35 },
    { date: 'Sun', tickets: 20 },
  ],
  categoryDistribution: [
    { name: 'Insults', value: 35, color: '#FB7185' },
    { name: 'Cheating', value: 25, color: '#FBBF24' },
    { name: 'Scam/Fraud', value: 15, color: '#0EA5E9' },
    { name: 'Bugs', value: 12, color: '#22D3EE' },
    { name: 'Payment', value: 8, color: '#34D399' },
    { name: 'Other', value: 5, color: '#94A3B8' },
  ],
  priorityDistribution: [
    { name: 'P0 (Critical)', value: 15, color: '#FB7185' },
    { name: 'P1 (High)', value: 30, color: '#FBBF24' },
    { name: 'P2 (Medium)', value: 35, color: '#22D3EE' },
    { name: 'P3 (Low)', value: 20, color: '#34D399' },
  ],
  statusDistribution: [
    { name: 'New', value: 12, color: '#94A3B8' },
    { name: 'AI Resolved', value: 45, color: '#34D399' },
    { name: 'Escalated', value: 18, color: '#FBBF24' },
    { name: 'Closed', value: 25, color: '#22D3EE' },
  ],
};
