export type ServiceSection = {
  id: string
  title: string
  lead: string
  paragraphs: readonly string[]
}

export type Service = {
  id: 'competitions' | 'training' | 'lab'
  title: string
  lead: string
  paragraphs: readonly string[]
  sections: readonly ServiceSection[]
  contact: {
    title: string
    prompt: string
    support: string
  }
}

export const services: readonly Service[] = [
  {
    id: 'competitions',
    title: 'Custom competitions',
    lead: 'We run custom forecasting competitions for universities, companies and other organisations. Participants forecast the same questions and are scored against real outcomes, leaving a clear record of which approaches work.',
    paragraphs: [
      'Participants forecast the same questions and are scored consistently, creating a clear record of forecasting ability and revealing which approaches work best.',
      'Each competition is tailored to the organisation’s needs, helping it evaluate predictive skill and learn from outcomes.',
    ],
    sections: [
      {
        id: 'how-it-works',
        title: 'How a competition works',
        lead: 'Everyone answers the same questions, and every answer is scored the same way.',
        paragraphs: [
          'A forecasting competition asks a group to make predictions about questions that will resolve. Each person states a probability, not only a yes or no, so the record shows how sure they were as well as which way they leaned.',
          'The questions are fixed in advance. Everyone sees the same wording, the same deadline, and the same account of how an answer will be scored. That shared frame is what makes the results comparable.',
          'Scoring waits until the outcome is known. A forecast is not judged on how persuasive it sounded when it was made. It is judged on what happened.',
        ],
      },
      {
        id: 'the-setting',
        title: 'Built for the setting',
        lead: 'A bespoke competition is built around the decisions an organisation actually faces.',
        paragraphs: [
          'The questions, the people taking part, and the scoring are chosen for that setting. A university cohort, a company team, and a public programme do not need the same contest.',
          'Questions can sit close to a decision the organisation is about to make, or further out, where the point is to see how people reason when the answer is not yet obvious.',
          'Taking part can be limited to a defined group, or opened to anyone the organisation wants to include. The design says who is forecasting, what they are asked, and how long the competition runs.',
        ],
      },
      {
        id: 'the-record',
        title: 'What the record shows',
        lead: 'The result is a record organisations can use to measure predictive ability, compare approaches, and learn from real world outcomes.',
        paragraphs: [
          'Once outcomes are known, the record shows who was well calibrated, which approaches held up, and where a confident forecast came apart.',
          'Calibration is whether stated confidence matched how often those forecasts were right. An approach can also be compared with another on the same questions, which is hard to do when people forecast different things in different ways.',
          'Organisations use that record to see where judgement is strong, where it needs work, and which ways of forecasting are worth keeping.',
        ],
      },
    ],
    contact: {
      title: 'Contact us',
      prompt: 'Have a forecasting competition in mind?',
      support:
        "Tell us who would take part, the decisions you care about, and what you would like the record to show. We'll help shape the questions and the scoring around that.",
    },
  },
  {
    id: 'training',
    title: 'Prediction training',
    lead: 'We help individuals and teams develop their forecasting through practice and feedback. They make probabilistic forecasts, review what happened, and use that record to improve their judgement.',
    paragraphs: [
      'Participants make probabilistic forecasts, track their accuracy and learn from past predictions. By reviewing what went right and wrong, they can identify weaknesses, improve their judgement and become better forecasters.',
    ],
    sections: [
      {
        id: 'the-loop',
        title: 'Forecast, then review',
        lead: 'People make probabilistic predictions, write down the reasoning behind them, and later compare that record with what happened.',
        paragraphs: [
          'The training is built around that loop. A session is not a lecture about uncertainty in the abstract. People practice making a forecast, leaving a trace of why they made it, and coming back when the outcome is known.',
          'Writing the reasoning down matters. It is easy to remember a forecast as more careful than it was. A written record makes the later review about what was actually believed at the time.',
          'The comparison is specific. It asks what was expected, how confident that expectation was, and what the world did instead.',
        ],
      },
      {
        id: 'where-judgment-slips',
        title: 'Where judgement slips',
        lead: 'Looking back shows where judgement is sharp and where it slips.',
        paragraphs: [
          'The slips the training looks for are familiar: too much confidence, an alternative that was never considered, or a forecast that was never checked.',
          'Too much confidence shows up when high probabilities are wrong more often than the forecaster expected. A missing alternative shows up when the outcome was thinkable, but it was not in the forecast.',
          'An unchecked forecast teaches nothing. The practice is to close the loop, so the next prediction is informed by the last one.',
        ],
      },
      {
        id: 'people-and-teams',
        title: 'Individuals and teams',
        lead: 'Individuals can take part on their own. Teams can train together.',
        paragraphs: [
          'On their own, people build a personal record of forecasts and reviews. Over time that record is more useful than a single exercise, because patterns in judgement take more than one question to see.',
          'Teams can train together, so making a forecast and then reviewing it becomes part of how a group reasons about uncertainty.',
          'Shared practice gives a team a common language for confidence, disagreement, and what would change a forecast. The aim is to improve by reviewing forecasts over time.',
        ],
      },
    ],
    contact: {
      title: 'Contact us',
      prompt: 'Interested in training for yourself or your team?',
      support:
        "Tell us who would take part and whether you want people to train on their own, together, or both. We'll talk through how the forecast-and-review loop would work for that group.",
    },
  },
  {
    id: 'lab',
    title: 'Prediction labs',
    lead: 'We research forecasting methods and build tools that turn forecasts and prediction-market data into practical insight for decisions.',
    paragraphs: [
      'Through experimentation and analysis, we investigate how people predict, evaluate new approaches and develop applications that turn predictive information into practical insights for decision-making.',
    ],
    sections: [
      {
        id: 'what-the-lab-studies',
        title: 'What the lab studies',
        lead: 'The lab studies forecasting methods and prediction market data.',
        paragraphs: [
          'Forecasting methods are the ways a prediction is made, expressed, and scored. The lab looks at which of those ways hold up when they are checked against outcomes, and which only look rigorous before the result is known.',
          'Prediction markets and other streams of predictive information produce a running picture of what people expect. The lab treats that picture as evidence to study, not as an answer to take on trust.',
          'The questions stay practical. A method is interesting when it changes what someone can do with a forecast, not only when it is elegant on its own.',
        ],
      },
      {
        id: 'tools',
        title: 'Tools for a decision',
        lead: 'The lab builds tools that make predictive information more useful in a real decision.',
        paragraphs: [
          'Evidence about how forecasts behave changes the questions people ask and the systems built around those questions. This is where measurement and practice meet.',
          'Those tools are meant to make predictive information easier to use: clearer questions, a record that can be scored, and a way to see what a set of forecasts is actually saying.',
          'A tool earns its place when someone can use it to make a forecast, compare it, or review it. The lab does not collect methods for their own sake.',
        ],
      },
      {
        id: 'tried-and-checked',
        title: 'Tried, then checked',
        lead: 'Ideas are tried, checked against outcomes, and kept when they make forecasting more useful.',
        paragraphs: [
          'The work stays close to competitions, which produce a record, and to training, which helps people use it.',
          'A competition is a place to see whether a question, a score, or a way of combining forecasts behaves as expected. Training is a place to see whether a practice helps a person or a team the next time they forecast.',
          'What does not hold up is dropped. What does is kept, and fed back into the competitions and the training.',
        ],
      },
    ],
    contact: {
      title: 'Contact us',
      prompt: 'Have a project for the lab?',
      support:
        "Whether you want to try a forecasting method, use predictive information in a decision, or explore a tool, we'd be glad to hear what you have in mind.",
    },
  },
]

export function getService(id: string | undefined) {
  return services.find((service) => service.id === id)
}
