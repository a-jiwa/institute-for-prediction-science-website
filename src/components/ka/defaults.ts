export const KA_CLOSE_HREF = '#ka-close'

export const KA_LOGOS = [
  '/assets/placeholders/khan/logo-6.webp',
  '/assets/placeholders/khan/logo-1.webp',
  '/assets/placeholders/khan/logo-2.webp',
  '/assets/placeholders/khan/logo-3.webp',
  '/assets/placeholders/khan/logo-4.webp',
  '/assets/placeholders/khan/logo-5.webp',
]

export const KA_TABS = [
  {
    label: 'Teams',
    title: 'Every team has a path through the contest.',
    body: 'Clear prompts and trusted notes, woven into a path that celebrates steady work and progress you can see.',
    icon: '/assets/placeholders/khan/headshot-1.webp',
    screen: '/assets/placeholders/khan/tab.avif',
    shape: 'pentagon' as const,
  },
  {
    label: 'Coaches',
    title: 'Sharper notes for coaches.\nA better round for teams.',
    body: 'Coaches get plain readouts and ready next steps, while the contest goals show up in every team’s round.',
    icon: '/assets/placeholders/khan/headshot-2.webp',
    screen: '/assets/placeholders/khan/tab-2.avif',
    shape: 'circle' as const,
  },
  {
    label: 'Contest leads',
    title: 'See contest-wide results with clarity.',
    body: 'Set a clear target and watch it pass down to every coach. Keep the rounds aligned and raise the stakes for all.',
    icon: '/assets/placeholders/khan/headshot-3.webp',
    screen: '/assets/placeholders/khan/tab-3.avif',
    shape: 'slant' as const,
  },
]

export const KA_FEATURE_CARDS = {
  title: 'How organisers use a contest to sharpen judgement',
  body: 'Trusted rounds and hands-on support raise forecast quality, prepare teams for the final call, and close gaps at every stage of the contest.',
  cards: [
    {
      title: 'Contest scoring',
      body: 'Early studies of this format show tighter forecasts. Teams build confidence with aligned prompts, grade-level practice, and help when a round stalls.',
      src: '/assets/placeholders/khan/services.svg',
      cta: { label: 'View the scores', href: KA_CLOSE_HREF },
    },
    {
      title: 'Final rounds',
      body: 'For the closing assessment, the contest supplies expert-written briefs, coaching for the people running it, and a plan for rolling the same round out widely.',
      src: '/assets/placeholders/khan/card-sat.webp',
      cta: { label: 'View the scores', href: KA_CLOSE_HREF },
    },
  ],
}

export const KA_ACCORDION = {
  title: 'More ways a contest can support you',
  items: [
    {
      title: 'Writing drills',
      body: 'Teams build a real written case, step by step. Coaches see where the reasoning thins out. Partners get a round where the writing itself is the work.',
      src: '/assets/placeholders/khan/card-1.webp',
      tone: '#72bb82',
    },
    {
      title: 'Live score reviews',
      body: 'A score that only says right or wrong stops too early. The review turns that moment into coaching, so leads can see how a team thought and where to help.',
      src: '/assets/placeholders/khan/acc-2.webp',
      tone: '#fcc539',
    },
    {
      title: 'Starter rounds for new teams',
      body: 'New teams learn the core moves through short, lively rounds. Coaches get a clear view of who is ready for the next brief.',
      src: '/assets/placeholders/khan/acc-3.webp',
      tone: '#f8a2d6',
    },
  ],
}

export const KA_CHIPS = [
  'Maths',
  'Drill sets',
  'Extended writing tasks',
  'Science',
  'Social topics',
  'Computing',
  'Economics',
  'Life skills',
  'Shared packs',
  'Coach guides',
].map((label, index) => ({
  label,
  icon: `/assets/placeholders/khan/subject-${index + 1}.svg`,
  href: KA_CLOSE_HREF,
}))

export const KA_SERVICES = {
  title: 'Support that drives strong contest outcomes',
  body: 'From the roster to the training to the check-ins after launch, the setup is there to help you hit the target you set. Teams that stay with the full support are far more likely to reach the recommended pace than teams working from the briefs alone.',
  cta: { label: 'Get in touch', href: KA_CLOSE_HREF },
  image: '/assets/placeholders/khan/card-2.webp',
  items: [
    {
      title: 'Reports that guide the work',
      body: 'Leads get plain, usable figures for tracking progress and spotting who needs a hand.',
      icon: '/assets/placeholders/khan/icon-chart.svg',
    },
    {
      title: 'A simple start for every roster',
      body: 'Organisers can have rostering and the opening setup handled for them.',
      icon: '/assets/placeholders/khan/icon-users.svg',
    },
    {
      title: 'Training shaped to your contest',
      body: 'Coaches and leads can also get training that fits the way their contest actually runs.',
      icon: '/assets/placeholders/khan/icon-folder.svg',
    },
    {
      title: 'Support that stays with you',
      body: 'Later check-ins and planning notes keep the contest pointed at the result you wanted.',
      icon: '/assets/placeholders/khan/icon-strategy.svg',
    },
  ],
}

export const KA_IMPACT = {
  kicker: 'Results',
  title: 'Backed by the scorebook. Sharper calls in every contest.',
  pink: {
    title: 'Teams deserve more than a raw score.',
    body: 'With coaching woven into the briefs and the practice, the help stays tied to the forecast itself, not to a novelty on the side.',
    image: '/assets/placeholders/khan/accordion.webp',
  },
  stats: [
    {
      value: '+30',
      label: 'score points',
      mark: '/assets/placeholders/khan/stat-map.webp',
      tone: 'yellow' as const,
    },
    {
      value: '3×',
      label: 'average lift',
      mark: '/assets/placeholders/khan/stat-njsla.webp',
      tone: 'orange' as const,
    },
  ],
  copy: {
    title: 'Several seasons of results show this contest tightens the calls.',
    body: 'If a team lands 60 more sound calls this year than last, the gain can move by a wide margin. On a scored final, that same stretch can triple the usual yearly lift.',
    actions: [
      { label: 'See the score notes', href: KA_CLOSE_HREF },
      { label: 'See the round notes', href: KA_CLOSE_HREF },
    ],
  },
  dark: {
    title: 'Learn from the teams already running this contest',
    body: 'Leads describe how the rounds are changing the calls their teams make.',
    cta: { label: 'Explore past rounds', href: KA_CLOSE_HREF },
  },
}

export const KA_QUOTE = {
  title: 'Built to serve the contest, not a margin',
  quote:
    'Success here is the quality of the forecasts. Every round is held to that. If it will not sharpen judgement, it does not belong in the contest.',
  author: {
    name: 'Alex Morgan',
    role: 'Programme lead',
    org: 'The institute',
    image: '/assets/placeholders/khan/quote.png',
  },
}

export const KA_STUDY = {
  title: 'A long run of contest results shows that steady practice leads to sharper forecasts across the field.',
  cta: { label: 'Request a walkthrough', href: KA_CLOSE_HREF },
}

export const KA_ASSESS_HERO = {
  variant: 'hero' as const,
  title: 'Move from counting scores to improving the calls',
  body: 'These rounds help a field see what teams still need, how they are thinking, and where each one should practise next.',
  image: '/assets/placeholders/khan/hero.png',
  imageFirst: false,
  actions: [
    { label: 'Book a walkthrough', href: KA_CLOSE_HREF },
    { label: 'Watch a round', href: KA_CLOSE_HREF, text: true },
  ],
}

export const KA_ASSESS_SCORES = {
  title: 'Better scores are not enough',
  paragraphs: [
    'A field does not only need more results. It needs a clearer view of what a team understands, where the call went soft, and what to do next.',
    'The contest joins that score to the next round of practice, so the number turns into a plan.',
  ],
  image: '/assets/placeholders/khan/split.png',
  imageFirst: true,
}

export const KA_ASSESS_TEACH = {
  title: 'Guess less, forecast more.',
  paragraphs: [
    'Our competitions and training are designed to fit into existing organisational schedules, with short, scored forecasting rounds completed in a single session and connected directly to clearer next decisions.',
  ],
  image: '/assets/placeholders/khan/teach.png',
  imageFirst: true,
}

export const KA_STEPS = {
  kicker: 'How it works',
  title: 'From assessment to action, one connected experience',
  items: [
    {
      kicker: 'Competitions',
      title: 'Custom forecasting challenges',
      body: [
        'We design and run fully managed forecasting competitions for universities, corporate teams, and institutions.',
        'Whether complementing a curriculum or improving forecasting skills, we turn subject matter into engaging, measurable prediction challenges so you can focus on the learning, not the setup.',
      ],
      bullets: [
        'Score the same questions the same way, against real outcomes',
        'Shape the contest around decisions your organisation faces',
        'See who was calibrated and which approaches held up',
      ],
      imageFirst: false,
      scheme: 'blue' as const,
      /** Floating Labs frame circles (no coloured media plate). */
      art: 'labs-frame' as const,
      cta: {
        label: 'Learn more',
        href: '/services/competitions',
      },
    },
    {
      kicker: 'Training',
      title: 'Practical judgment programs',
      body: 'We deliver practical training programs that improve judgment and critical thinking. Through hands-on practice, we teach students, researchers, and professionals how to evaluate evidence, account for uncertainty, and improve predictive accuracy over time.',
      bullets: [
        'Practice forecasts with a clear review loop',
        'Spot overconfidence and missed alternatives',
        'Build a personal or team record over time',
      ],
      imageFirst: true,
      scheme: 'green' as const,
      art: 'balance' as const,
      cta: {
        label: 'Learn more',
        href: '/services/training',
      },
    },
    {
      kicker: 'Labs',
      title: 'Forecasting innovation lab',
      body: 'We conduct applied research, build software, and incubate new tools. Our lab develops practical applications and spins out solutions for policymakers, industry, and the public.',
      bullets: [
        'Study methods that hold up against real outcomes',
        'Turn prediction-market data into usable insight',
        'Build tools that support real decisions',
      ],
      imageFirst: false,
      scheme: 'red' as const,
      /** Hex + triangle composition from photo-frame-hex.svg. */
      art: 'hex' as const,
      cta: {
        label: 'Learn more',
        href: '/services/lab',
      },
    },
  ],
}

export const KA_PULL_QUOTE = {
  title: 'Make the thinking visible',
  quote:
    'The useful part is the shift from whether the team got the call to how the team was thinking. Real fluency, in a forecast or a written case, shows up in that working.',
  author: {
    name: 'Sam Okonkwo',
    role: 'Team coach',
    org: 'North district',
    image: '/assets/placeholders/khan/quote-2.png',
  },
}

export const KA_COURSES = {
  title: 'What is on the card for next season?',
  body: 'The rounds planned from next season onward include:',
  rows: [
    {
      label: 'This year',
      columns: [
        ['Round I', 'Round II', 'Finals', 'Heat 6, 7, 8'],
        ['Brief 9–10', 'Brief 11–12', 'Brief 6, 7, 8'],
      ],
    },
    {
      label: 'Next year',
      columns: [['Heat 3, 4, 5'], ['Brief 3, 4, 5']],
    },
  ],
}

export const KA_CLOSE = {
  title: 'Help coaches spend less time reading scores and more time with their own teams',
  body: 'See how a contest like this could run for your field.',
  cta: { label: 'Request a walkthrough', href: KA_CLOSE_HREF },
}

export const KA_INTRO = {
  title: 'A clearer way to run district contests',
  body: 'Organisers want every team to improve. So do we. We built this contest flow with the tools leaders need to keep every round fair, clear, and useful.',
  cta: { label: 'Request a walkthrough', href: KA_CLOSE_HREF },
  logosLabel: 'Used by organisers in every region',
  logos: KA_LOGOS,
  tabsLabel: 'Audience',
  tabs: KA_TABS,
}
