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
