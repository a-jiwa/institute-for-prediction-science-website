import researchAll from './research-all.json'
import { SITE_NAME } from '../components/icons/Logo'

export type ResearchItem = {
  href: string
  external?: boolean
  type: string
  title: string
  image: string
  excerpt: string
  date: string
  size: string
}

export type ResearchAuthor = {
  name: string
  role: string
  bio?: string
}

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'h3'; text: string }
  | { type: 'note'; text: string }
  | { type: 'formula'; text: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }

export type ArticleSection = {
  id: string
  heading: string
  blocks: ArticleBlock[]
}

export type ArticleContent = {
  lead: string
  intro: string[]
  sections: ArticleSection[]
  authors: ResearchAuthor[]
}

export const researchItems = researchAll as ResearchItem[]

/** Papers listed on the research page. Anything else is not a page. */
const FEED: Array<{
  slug: string
  title: string
  excerpt: string
  image: string
  authors?: string[]
}> = [
  {
    slug: 'introducing-the-institute-for-prediction-science',
    title: 'Introducing the Institute for Prediction Science',
    excerpt:
      'Why we founded a research institute dedicated to empirical forecasting and better decision making.',
    image: '/assets/img/research/research-01.webp',
    authors: ['Philip Tetlock', 'Josh Rosenberg', 'Ezra Karger'],
  },
  {
    slug: 'infrastructure-for-measuring-prediction',
    title: 'Infrastructure for measuring prediction',
    excerpt:
      'A research platform built to collect, track, and score probabilistic forecasts over time.',
    image: '/assets/img/research/research-08.webp',
  },
  {
    slug: 'evaluating-training-in-human-forecasting',
    title: 'Evaluating training in human forecasting',
    excerpt:
      'Experimental evidence showing that structured training measurably improves probabilistic accuracy.',
    image: '/assets/img/research/research-02.webp',
  },
]

function itemBySlug(slug: string) {
  return researchItems.find((item) => researchSlug(item.href) === slug) ?? null
}

export function researchFeed(): ResearchItem[] {
  const items = FEED.flatMap((entry) => {
    const base = itemBySlug(entry.slug)
    if (!base) return []
    const placeholder =
      /placeholder/i.test(entry.title) || /goes here/i.test(entry.excerpt)
    const title = placeholder ? base.title : entry.title
    return [
      {
        ...base,
        href: `/research/${entry.slug}`,
        title,
        excerpt: placeholder ? base.excerpt : entry.excerpt,
        image: entry.image || base.image,
      },
    ]
  })
  return sortResearch(items)
}

export function feedAuthors(item: ResearchItem): ResearchAuthor[] {
  const entry = FEED.find((row) => row.slug === researchSlug(item.href))
  if (!entry?.authors?.length) return articleAuthors(item)
  return entry.authors.map((name) => {
    const known = DEFAULT_AUTHORS.find((author) => author.name === name)
    return known ?? { name, role: SITE_NAME }
  })
}

const DEFAULT_AUTHORS: ResearchAuthor[] = [
  {
    name: 'Ezra Karger',
    role: 'Director of Research',
    bio: 'Ezra leads the institute’s research programme on forecasting, judgement, and the use of prediction in high stakes decisions.',
  },
  {
    name: 'Philip Tetlock',
    role: 'President, Chief Scientist',
    bio: 'Philip’s work on forecasting tournaments and expert judgement underpins much of the institute’s approach to measuring and improving prediction.',
  },
  {
    name: 'Josh Rosenberg',
    role: 'CEO',
    bio: 'Josh oversees the institute’s strategy and partnerships, connecting research on prediction science to organisations and public audiences.',
  },
  {
    name: 'Bridget Williams',
    role: 'Associate Director of Research & Strategy',
    bio: 'Bridget works across research design, strategy, and applications of forecasting methods to organisational and policy questions.',
  },
  {
    name: 'Jessie Barker',
    role: 'Senior Researcher',
    bio: 'Jessie studies forecasting methods, tournament design, and how people update beliefs when faced with evidence and opposing views.',
  },
]

export function researchSlug(href: string) {
  return href.split('/').filter(Boolean).pop() ?? ''
}

export function findResearch(slug: string) {
  const entry = FEED.find((row) => row.slug === slug)
  if (!entry) return null
  const base = researchItems.find((item) => !item.external && researchSlug(item.href) === slug)
  if (!base) return null
  return {
    ...base,
    href: `/research/${entry.slug}`,
    title: entry.title,
    excerpt: entry.excerpt,
    image: entry.image || base.image,
  }
}

function timestamp(date: string) {
  // Ongoing projects sit below dated publications in reverse-chrono lists.
  if (date === 'Ongoing') return Number.NEGATIVE_INFINITY
  const value = Date.parse(date)
  return Number.isNaN(value) ? 0 : value
}

export function sortResearch(items: ResearchItem[]) {
  return [...items].sort((a, b) => timestamp(b.date) - timestamp(a.date))
}

function hashSlug(value: string) {
  let total = 0
  for (const char of value) total += char.charCodeAt(0)
  return total
}

export function articleAuthors(item: ResearchItem): ResearchAuthor[] {
  const slug = researchSlug(item.href)
  const start = hashSlug(slug) % DEFAULT_AUTHORS.length
  const count = item.type === 'Editorial' || item.type === 'Project' ? 1 : 2
  return Array.from({ length: count }, (_, index) => DEFAULT_AUTHORS[(start + index) % DEFAULT_AUTHORS.length])
}

export function authorByline(authors: ResearchAuthor[]) {
  if (authors.length === 0) return SITE_NAME
  if (authors.length === 1) return authors[0].name
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`
  return `${authors.slice(0, -1).map((author) => author.name).join(', ')}, and ${authors.at(-1)?.name}`
}

export function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Subheadings use sentence case: only the first letter capitalised. */
function sentenceCaseHeading(heading: string) {
  const trimmed = heading.trim()
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

function withSentenceCaseHeadings(sections: ArticleSection[]): ArticleSection[] {
  return sections.map((section) => ({
    ...section,
    heading: sentenceCaseHeading(section.heading),
  }))
}

const AUTHORED_ARTICLES: Record<
  string,
  {
    lead: string
    intro?: string[]
    sections: ArticleSection[]
  }
> = {
  'introducing-the-institute-for-prediction-science': {
    lead:
      'Why we founded a research institute dedicated to empirical forecasting and better decision making.',
    intro: [
      'The ability to anticipate future events is fundamental to how we make decisions, yet the science of forecasting remains an underdeveloped discipline. We believe that improving how people reason about the future is one of the most important challenges facing individuals, organisations and society.',
    ],
    sections: [
      {
        id: 'mission',
        heading: 'Mission',
        blocks: [
          {
            type: 'p',
            text: `The ${SITE_NAME} aims to advance the science and practice of forecasting, and improve how individuals and organisations navigate an uncertain future. Through research, education and practical application, we seek to develop better methods for evaluating evidence, measuring uncertainty and making more accurate predictions. Our ambition is to help establish forecasting as a rigorous, measurable and widely applicable discipline, strengthening the quality of decisions made across society.`,
          },
          {
            type: 'p',
            text: 'Every day, individuals and institutions make decisions based on assumptions about what will happen next. Governments anticipate economic and political developments, businesses plan for changes in markets and consumer behaviour, and researchers consider the likelihood of scientific discoveries. Yet despite the importance of these judgements, the processes through which they are formed are often informal, inconsistent and difficult to evaluate. We frequently confuse confidence with accuracy, overlook uncertainty and fail to distinguish between what we know and what we believe. As a result, opportunities to learn from our predictions and improve our judgement are often lost.',
          },
          {
            type: 'p',
            text: 'We believe that forecasting can be approached differently. Prediction science provides a structured framework for thinking about the future, combining evidence, analytical reasoning and probabilistic thinking to assess the likelihood of different outcomes. Rather than treating predictions as statements of certainty, it recognises that the future is inherently uncertain and that good judgement requires us to account for that uncertainty. By expressing predictions in measurable terms, recording them and evaluating them against actual outcomes, we can move beyond intuition and develop a more systematic understanding of predictive accuracy. Importantly, forecasting is not simply an innate ability; research suggests that it is a skill that can be developed through deliberate practice, feedback and continuous evaluation.',
          },
          {
            type: 'p',
            text: 'However, developing better forecasting capabilities requires more than improved methods. It requires a broader change in how we approach decisions about the future. Too often, predictions are made without being recorded, assumptions remain unexamined and incorrect judgements carry few consequences for those who make them. Without a reliable record of what was anticipated, it becomes difficult to distinguish accurate judgement from hindsight or to understand where our reasoning went wrong. We need approaches that make predictions visible, create opportunities for meaningful feedback and encourage people to update their beliefs as new evidence emerges. This is essential not only for improving individual judgement, but also for building more informed and resilient institutions.',
          },
          {
            type: 'p',
            text: `We are establishing the ${SITE_NAME} to advance the research, collaboration and practical application needed to address these challenges. Our work focuses on three interconnected areas: developing and managing forecasting competitions, delivering practical training programmes, and conducting applied research through our forecasting innovation lab. Together, these activities provide a foundation for exploring how predictive judgement can be improved, how forecasting methods can be applied across different fields and how new tools can make the practice of prediction more accessible and effective. By connecting academic research with real-world application, we aim to help translate advances in prediction science into meaningful improvements in decision-making.`,
          },
          {
            type: 'p',
            text: 'The Institute is a platform for researchers, educators, professionals and organisations to explore the possibilities of better forecasting. We work across disciplines and sectors because the challenges of anticipating the future rarely fit within a single area of expertise. Questions about economic change, technological development, public policy, scientific progress and societal trends all require different forms of knowledge, yet share a common need to reason carefully about uncertainty. Bringing these perspectives together allows us to examine forecasting from multiple angles, develop new approaches and identify opportunities for collaboration. We believe that progress in prediction science depends on an open exchange of ideas, rigorous evaluation and a willingness to challenge established assumptions.',
          },
          {
            type: 'p',
            text: 'No single method or institution can eliminate uncertainty or provide definitive answers about what the future holds. Predictions will always be subject to incomplete information, changing circumstances and the limitations of human judgement. The objective is not to remove uncertainty, but to understand it better and make more informed decisions in its presence. By developing the science, methods and capabilities needed to anticipate future events, we can improve our ability to recognise emerging opportunities, prepare for potential risks and respond to an increasingly complex world. Advancing prediction science is therefore not simply about becoming better at predicting what happens next; it is about equipping society to make better decisions about what comes next.',
          },
        ],
      },
    ],
  },
  'infrastructure-for-measuring-prediction': {
    lead:
      'A research platform built to collect, track, and score probabilistic forecasts over time.',
    intro: [],
    sections: [
      {
        id: 'introduction',
        heading: 'Introduction',
        blocks: [
          {
            type: 'p',
            text: 'Human beings constantly make predictions about the future. We anticipate political developments, economic changes, technological breakthroughs, and the behaviour of other people. Yet despite the importance of these judgements, our ability to predict future events remains difficult to study systematically.',
          },
          {
            type: 'p',
            text: 'The problem is partly one of measurement. People regularly express opinions about what might happen, but these are rarely recorded in a form that allows their accuracy to be assessed objectively. Once an event has occurred, recollections of earlier expectations are vulnerable to hindsight, selective memory, and retrospective reinterpretation. To understand how well people predict the future, we must capture their expectations before the future becomes the past.',
          },
          {
            type: 'p',
            text: 'This requires more than collecting predictions. Each forecast must refer to a clearly defined event, express a measurable degree of confidence, and remain recorded until its outcome can be established. Predictions must then be evaluated consistently, allowing performance to be compared across questions, individuals, and time.',
          },
          {
            type: 'p',
            text: 'To address this problem, the Institute has developed a research platform designed to make human forecasting measurable. By bringing together accessible question design, probabilistic predictions, outcome resolution, and longitudinal data collection, the platform provides an infrastructure for studying how people anticipate future events and how accurately those expectations correspond to reality.',
          },
        ],
      },
      {
        id: 'designing-a-system-for-prediction',
        heading: 'Designing a system for prediction',
        blocks: [
          {
            type: 'p',
            text: 'A fundamental requirement of forecasting research is that predictions must be made before the outcomes they concern are known. This creates a contemporaneous record of what someone actually expected, rather than relying on their subsequent recollection. It also establishes the temporal relationship between a prediction and the event against which it will eventually be evaluated.',
          },
          {
            type: 'p',
            text: "The questions themselves are equally important. A prediction can only be assessed reliably if the event it describes is sufficiently precise to determine whether it occurred. Questions must therefore be carefully worded, with clearly defined outcomes and timeframes. At the same time, they must remain accessible and understandable to participants without requiring specialist knowledge. Balancing precision with accessibility is central to the platform's design: questions need to be scientifically assessable without becoming unnecessarily technical or difficult to interpret.",
          },
          {
            type: 'p',
            text: 'The platform allows participants to express their predictions as probabilities between 0% and 100%. Rather than simply asking whether an event will happen, it captures how likely each participant considers that event to be. This preserves differences in expectation and confidence that a simple yes-or-no answer would lose.',
          },
          {
            type: 'p',
            text: 'The forecasting process follows an annual cycle. Participants complete a fixed set of questions at the beginning of the year, submitting their probability estimates before the forecasting period begins. Once submitted, their predictions are locked, creating a fixed record of their expectations. As events unfold throughout the year, individual questions are resolved and results are updated, allowing participants and researchers to observe how the original predictions correspond to actual outcomes.',
          },
          {
            type: 'p',
            text: 'Each prediction is associated with its corresponding question, participant, and forecasting period. This creates a connected record that can be revisited as events are resolved and retained alongside previous forecasting exercises. The platform therefore supports not only individual forecasting rounds, but the accumulation of comparable observations across successive years.',
          },
        ],
      },
      {
        id: 'measurement-and-longitudinal-observation',
        heading: 'Measurement and longitudinal observation',
        blocks: [
          {
            type: 'p',
            text: 'Recording predictions is only the first part of the research process. To study forecasting ability, predictions must be compared with what actually happens. The platform uses a consistent evaluation process to assess individual forecasts and aggregate performance across the questions in each annual exercise.',
          },
          {
            type: 'p',
            text: 'The value of this approach lies in measuring predictions as probabilities rather than simply counting correct answers. Someone who assigns an event a 90% probability has expressed a different expectation from someone who assigns it 55%, even if the event ultimately occurs in both cases. Preserving these differences makes it possible to study not only whether participants anticipate outcomes correctly, but how well their confidence corresponds to reality. The Institute uses the Brier score for this evaluation, with the detailed scoring methodology described separately.',
          },
          {
            type: 'p',
            text: "Repeated observations are particularly important. A single correct prediction tells us relatively little about someone's underlying forecasting ability. Performance across a range of questions provides a more informative assessment, while repeated annual exercises allow researchers to examine whether individual performance remains consistent or changes over time.",
          },
          {
            type: 'p',
            text: 'Because participants can return across successive years, the platform can maintain a longitudinal record of their predictions and performance. This creates opportunities to investigate differences between individuals, the relationship between confidence and accuracy, and whether forecasting ability develops with experience. It also allows researchers to examine how performance varies across different types of questions and subject areas.',
          },
          {
            type: 'p',
            text: 'Achieving this requires consistency in how questions are designed, predictions are recorded, and outcomes are resolved. The platform is therefore structured to preserve the relationship between participants, their original predictions, and the eventual outcomes, while supporting multiple forecasting periods within the same research environment. These properties are essential to building a dataset that remains useful for analysis over time.',
          },
        ],
      },
      {
        id: 'a-research-infrastructure-for-studying-human-forecasting',
        heading: 'A research infrastructure for studying human forecasting',
        blocks: [
          {
            type: 'p',
            text: 'The significance of the platform extends beyond running annual forecasting competitions. By establishing a consistent process for collecting, preserving, and evaluating predictions, it creates the conditions for studying forecasting as a measurable human capability.',
          },
          {
            type: 'p',
            text: 'A growing record of probabilistic predictions can support research into differences between individuals, the relationship between confidence and accuracy, and the extent to which people correctly estimate the likelihood of future events. It can also help researchers investigate whether forecasting performance changes with experience, whether certain types of questions are more difficult to predict, and how stable individual performance remains over time.',
          },
          {
            type: 'p',
            text: 'These questions require more than a forecasting competition. A competition primarily seeks to identify who performs best. A research platform must also preserve the observations and outcomes needed to understand performance and investigate how it changes. Its value lies not simply in identifying accurate forecasters, but in making their predictions available for systematic analysis.',
          },
          {
            type: 'p',
            text: "The Institute's platform provides the foundation for this work. By recording expectations before events occur, expressing them as probabilities, and evaluating them against clearly defined outcomes, it establishes a repeatable framework for the empirical study of human prediction. Repeating this process across successive years allows individual forecasts to become part of a larger and increasingly valuable body of evidence.",
          },
          {
            type: 'p',
            text: 'Understanding how people predict the future requires us to observe not only what they believe will happen, but how those beliefs correspond to what actually happens. The development of reliable research infrastructure makes this possible, turning an everyday human activity into something that can be measured, compared, and studied systematically.',
          },
        ],
      },
    ],
  },
  'evaluating-training-in-human-forecasting': {
    lead:
      'Experimental evidence showing that structured training measurably improves probabilistic accuracy.',
    intro: [],
    sections: [
      {
        id: 'abstract',
        heading: 'Abstract',
        blocks: [
          {
            type: 'p',
            text: 'The ability to anticipate future events is important across almost every area of human activity. Decisions in government, business, science and everyday life depend on judgements about what is likely to happen, often in circumstances where information is incomplete and outcomes are uncertain. Yet people frequently make these judgements intuitively, without explicitly considering probabilities or systematically evaluating the accuracy of their predictions.',
          },
          {
            type: 'p',
            text: 'This study examines whether forecasting performance can be improved through structured training. In an illustrative study design, 240 participants were randomly allocated to either a training group or an untrained comparison group. Both groups completed a forecasting exercise consisting of 70 questions about future events. The training introduced a structured approach to prediction, emphasising the definition of events, probabilistic reasoning, consideration of base rates, systematic information gathering and the evaluation of forecasts using the Brier score.',
          },
          {
            type: 'p',
            text: 'Participants who received training achieved better forecasting performance than those who did not. The illustrative mean Brier score was 0.182 for trained participants, compared with 0.211 for untrained participants, a difference of 0.029 points. This represents an improvement of approximately 13.7% relative to the comparison group’s mean Brier score.',
          },
          {
            type: 'p',
            text: 'These example findings demonstrate how evidence of improved performance could be reported and analysed. If supported by the actual study data, they would provide evidence that forecasting performance is not simply a fixed individual attribute, but can be improved through instruction in methods for reasoning under uncertainty.',
          },
        ],
      },
      {
        id: 'the-challenge-of-prediction',
        heading: 'The challenge of prediction',
        blocks: [
          {
            type: 'p',
            text: 'Almost every important decision involves a prediction. Governments must anticipate economic conditions, businesses must assess future demand, scientists must consider the likely consequences of competing hypotheses, and individuals must make choices based on events that have not yet occurred.',
          },
          {
            type: 'p',
            text: 'Despite its importance, prediction is often treated as an informal activity. People make judgements about what will happen using experience, intuition, available information and their interpretation of current events. These judgements may be expressed with considerable confidence, but the reasoning behind them is rarely systematic. Nor are predictions routinely recorded in a way that allows their accuracy to be evaluated afterwards.',
          },
          {
            type: 'p',
            text: 'This creates a fundamental problem. If predictions are not expressed clearly, assigned probabilities and compared with subsequent outcomes, it is difficult to distinguish reliable judgement from confidence, hindsight or chance. People may remember their successful predictions while overlooking their mistakes. They may also interpret an uncertain event as having been obvious once it has occurred.',
          },
          {
            type: 'p',
            text: 'A more rigorous approach begins by treating prediction as a measurable activity. Rather than simply asking whether someone was right or wrong, a forecaster assigns a probability to a clearly defined future event. A prediction can then be evaluated against the outcome, taking account not only of whether the event occurred but also of how likely the forecaster believed it to be.',
          },
          {
            type: 'p',
            text: 'This approach makes it possible to study forecasting performance systematically. It also raises an important question: if people can be assessed on their ability to make probabilistic predictions, can that ability be improved through training?',
          },
          {
            type: 'p',
            text: 'The present study addresses this question by comparing the forecasting performance of participants who received structured instruction with that of participants who did not.',
          },
        ],
      },
      {
        id: 'from-intuition-to-structured-forecasting',
        heading: 'From intuition to structured forecasting',
        blocks: [
          {
            type: 'p',
            text: 'Forecasting is not simply a matter of knowing more information. It requires a process for interpreting evidence, assessing uncertainty and translating judgement into a probability. A person may have access to extensive information and still make poor predictions if they interpret that information inconsistently or fail to consider alternative outcomes.',
          },
          {
            type: 'p',
            text: 'The training used in this study was designed to introduce a more disciplined approach. It drew on several complementary principles.',
          },
          { type: 'h3', text: 'Defining the event' },
          {
            type: 'p',
            text: 'The first requirement of a useful forecast is a clearly defined question. Vague questions encourage ambiguous interpretations and make it difficult to determine whether a prediction was correct. A forecasting question should specify the event being considered and, where necessary, the conditions and timeframe under which it will be resolved.',
          },
          {
            type: 'p',
            text: 'The training encouraged participants to simplify questions into a binary outcome: either the specified event occurs or it does not. This does not mean that the forecast itself must be expressed as a binary judgement. On the contrary, the forecaster must still consider the full range of uncertainty and assign a probability between 0% and 100%.',
          },
          {
            type: 'p',
            text: 'This distinction is important. A question may have two possible outcomes, but the probability of either outcome need not be certain. A forecast of 70%, for example, expresses a judgement that the event is more likely to occur than not, while acknowledging a meaningful possibility that it will not.',
          },
          {
            type: 'p',
            text: 'Explicitly defining the event helps separate the question being answered from the wider narrative surrounding it. It also makes subsequent evaluation possible.',
          },
          { type: 'h3', text: 'Considering base rates and alternative explanations' },
          {
            type: 'p',
            text: 'People often focus on the particular circumstances of an event while overlooking how frequently similar events occur. This can lead to predictions that are disproportionately influenced by recent developments, compelling explanations or unusual examples.',
          },
          {
            type: 'p',
            text: 'The training therefore encouraged participants to consider broader patterns and relevant base rates. Before reaching a conclusion about a specific event, a forecaster should consider how often comparable events have occurred and whether the available evidence justifies departing from that starting point.',
          },
          {
            type: 'p',
            text: 'This does not mean that historical frequencies should determine every forecast. Conditions change, and specific evidence may provide good reasons to expect a different outcome. Base rates instead provide a reference point against which new information can be assessed.',
          },
          {
            type: 'p',
            text: 'The training also introduced the principle of avoiding unnecessarily complicated explanations. In forecasting, a persuasive narrative is not necessarily a reliable one. A prediction should be based on the evidence that is relevant to the event, rather than on a chain of speculative assumptions.',
          },
          {
            type: 'p',
            text: 'Simplicity should not be treated as a substitute for analysis. Its value is in encouraging forecasters to examine whether their conclusions depend on assumptions that are unsupported or unnecessary.',
          },
          { type: 'h3', text: 'Gathering and evaluating information' },
          {
            type: 'p',
            text: 'A further component of the training concerned the collection and evaluation of evidence. Forecasts are often made in environments where information is incomplete, changing or contradictory. The challenge is therefore not simply to find information, but to determine which information is relevant and how much weight it should receive.',
          },
          {
            type: 'p',
            text: 'The training introduced the use of artificial intelligence as a tool for identifying information and potential sources. It emphasised that such tools should support research rather than replace independent evaluation. Information obtained through AI systems must be checked against credible sources, and generated answers should not be treated as authoritative simply because they are expressed confidently.',
          },
          {
            type: 'p',
            text: "This distinction reflects a broader principle of forecasting: the quality of a prediction depends partly on the quality of the evidence used to form it, but also on the forecaster's ability to evaluate that evidence critically.",
          },
          { type: 'h3', text: 'Expressing and evaluating probabilities' },
          {
            type: 'p',
            text: 'The final component was the explicit use of probabilities and performance measurement. Rather than recording predictions as simple statements of confidence, participants were asked to assign numerical probabilities to future events.',
          },
          {
            type: 'p',
            text: "This makes uncertainty visible. A prediction of 60% is different from one of 90%, even if both ultimately prove correct. The probability records the forecaster's judgement at the time the prediction was made, allowing it to be evaluated against the outcome.",
          },
          {
            type: 'p',
            text: 'The training introduced the Brier score as a method of evaluating probabilistic forecasts. For a binary event, the score is calculated as:',
          },
          { type: 'formula', text: 'BS = (f − o)²' },
          {
            type: 'p',
            text: 'where f is the forecast probability, expressed between 0 and 1, and o is the observed outcome, represented as either 0 or 1.',
          },
          {
            type: 'p',
            text: 'A lower Brier score indicates better probabilistic accuracy. A forecast that assigns a high probability to an event that occurs receives a relatively low score. A forecast that assigns a high probability to an event that does not occur receives a higher score.',
          },
          {
            type: 'p',
            text: 'When multiple questions are evaluated, individual scores can be averaged to provide an overall measure of forecasting performance. This allows the accuracy of forecasts to be compared across participants and across a set of different events.',
          },
          {
            type: 'p',
            text: 'The Brier score is not a complete description of forecasting ability. In particular, overall probabilistic accuracy should not be confused with calibration, which concerns the correspondence between stated probabilities and observed frequencies. Nor does a single aggregate score explain why a forecast performed well or poorly. Nevertheless, it provides a consistent and mathematically defined basis for comparing probabilistic predictions.',
          },
          {
            type: 'p',
            text: 'Taken together, these principles provide a structured alternative to relying exclusively on intuition. They encourage forecasters to define the question, consider relevant historical evidence, evaluate new information and express their conclusions in a form that can be measured.',
          },
        ],
      },
      {
        id: 'testing-forecasting-improvement',
        heading: 'Testing forecasting improvement',
        blocks: [
          {
            type: 'p',
            text: 'The existence of a structured forecasting method does not, by itself, demonstrate that it improves performance. That requires empirical evaluation.',
          },
          {
            type: 'p',
            text: 'The present study examined whether participants who received forecasting instruction performed better than participants who did not receive the training. Both groups undertook a forecasting task, allowing their predictions to be evaluated using a common performance measure.',
          },
          {
            type: 'p',
            text: 'The central research question was:',
          },
          {
            type: 'p',
            text: 'Does structured training in probabilistic forecasting improve the accuracy of people’s predictions about future events?',
          },
          {
            type: 'p',
            text: 'The principal hypothesis was that participants who received training would achieve better forecasting performance than participants who did not.',
          },
          { type: 'h3', text: 'Study design and participants' },
          {
            type: 'p',
            text: 'For this illustrative example, the study involved 240 participants, randomly allocated in equal numbers to two groups. The training group comprised 120 participants, and the comparison group comprised 120 participants who did not receive the training.',
          },
          {
            type: 'p',
            text: 'Random allocation was used in this example to reduce the likelihood that pre-existing differences between participants would account for subsequent differences in performance. Both groups completed the same forecasting exercise.',
          },
          { type: 'h3', text: 'The training intervention' },
          {
            type: 'p',
            text: 'Participants in the training group received structured instruction based on the forecasting framework described above. The material covered the definition of forecast questions, binary simplification, base-rate reasoning, the evaluation of information, the use of AI-assisted research and probabilistic scoring.',
          },
          {
            type: 'p',
            text: 'The training was intended to give participants a repeatable process for making predictions rather than simply providing additional factual knowledge. It encouraged them to approach each question systematically, distinguish evidence from assumptions and express uncertainty through numerical probabilities.',
          },
          {
            type: 'p',
            text: 'For this example, the intervention consisted of a written guide and practical exercises completed before the forecasting exercise. The comparison group did not receive the training intervention.',
          },
          { type: 'h3', text: 'Forecasting task and performance measurement' },
          {
            type: 'p',
            text: 'Both groups completed a forecasting exercise consisting of 70 questions about future events. Participants expressed their predictions as probabilities on a scale from 0% to 100%. Forecasts were recorded before the outcomes were known and were subsequently evaluated against the resolved outcomes.',
          },
          {
            type: 'p',
            text: 'The study used the Brier score to evaluate forecasting performance. Individual scores were calculated from the difference between the forecast probability and the eventual outcome. Scores were then averaged across the 70 questions to provide a mean Brier score for each participant.',
          },
          {
            type: 'p',
            text: 'The primary comparison was between the mean participant-level Brier scores of the trained and untrained groups. Lower scores represented better forecasting performance.',
          },
          { type: 'h3', text: 'Statistical analysis' },
          {
            type: 'p',
            text: 'The primary analysis compared the mean Brier scores of the two groups. The difference between groups was estimated, together with a 95% confidence interval.',
          },
          {
            type: 'p',
            text: 'Because participants answered multiple questions, and the same questions were answered by multiple participants, individual forecasts could not necessarily be treated as independent observations. An appropriate analysis would account for clustering by participant and question, for example through a mixed-effects model with participant-level and question-level effects.',
          },
          {
            type: 'p',
            text: 'The analysis should distinguish overall probabilistic accuracy from more specific properties of forecasting behaviour. An improvement in mean Brier score does not, on its own, establish that participants became better calibrated or more capable of distinguishing between events that were likely and unlikely to occur. Those questions require additional analysis.',
          },
        ],
      },
      {
        id: 'evidence-of-improved-performance',
        heading: 'Evidence of improved performance',
        blocks: [
          {
            type: 'p',
            text: 'In this illustrative example, participants who received forecasting training achieved a mean Brier score of 0.182, compared with 0.211 among participants who did not receive training.',
          },
          {
            type: 'table',
            caption: 'Table 1: Mean Brier score by study group',
            headers: ['Measure', 'Trained group', 'Untrained group'],
            rows: [
              ['Participants', '120', '120'],
              ['Mean Brier score', '0.182', '0.211'],
              ['Standard deviation', '0.061', '0.064'],
              ['Transformed score (100 × (1 − Brier score))', '81.8', '78.9'],
            ],
          },
          {
            type: 'p',
            text: 'The difference in mean Brier score was 0.029 points in favour of the trained group. This represents a 13.7% lower mean Brier score relative to the untrained group. Expressed using the transformed scoring scale, the difference was 2.9 points.',
          },
          {
            type: 'p',
            text: 'For this illustrative dataset, a mixed-effects analysis accounting for participant and question-level variation produced an estimated group difference of −0.028 Brier points (95% confidence interval: −0.044 to −0.012; p = 0.001). The negative estimate indicates a lower, and therefore better, Brier score among trained participants.',
          },
          {
            type: 'p',
            text: "The example results indicate a measurable difference between the two groups. The difference is not simply that trained participants made more correct binary predictions. Because the Brier score evaluates the probability assigned to each outcome, the result reflects the accuracy of the participants' probabilistic judgements across the forecasting exercise.",
          },
          {
            type: 'p',
            text: 'The finding is significant because forecasting is often treated as an ability that people either possess or lack. Some individuals are regarded as naturally perceptive, while others are considered less capable of anticipating future developments. Such distinctions may overlook the extent to which forecasting depends on methods that can be learned and applied.',
          },
          {
            type: 'p',
            text: 'The training in this study did not attempt to teach participants the outcomes of particular future events. Instead, it introduced a process for approaching uncertain questions. Participants were encouraged to define events precisely, consider historical frequencies, assess evidence systematically and express their judgements as probabilities.',
          },
          {
            type: 'p',
            text: 'The example performance difference is consistent with the proposition that these practices can make forecasting more effective. It suggests that at least part of the variation in forecasting performance may be amenable to improvement through instruction.',
          },
          {
            type: 'p',
            text: 'The result should nevertheless be interpreted in the context of the study design. The strength of the causal conclusion depends on the actual allocation procedure, the comparability of the groups and whether both groups completed the same forecasting task under equivalent conditions. Random allocation would provide stronger evidence that training caused the improvement than a non-random comparison.',
          },
        ],
      },
      {
        id: 'implications-for-human-forecasting',
        heading: 'Implications for human forecasting',
        blocks: [
          {
            type: 'p',
            text: 'If forecasting performance can be improved through structured training, the implications extend beyond the study itself.',
          },
          {
            type: 'p',
            text: 'Prediction is central to decision-making wherever people must act before outcomes are known. In many settings, the consequences of poor forecasting can be substantial. Organisations may invest resources based on expectations of future demand; public institutions may develop policies in response to anticipated risks; and researchers may allocate time and funding according to judgements about the likely direction of scientific progress.',
          },
          {
            type: 'p',
            text: 'In these environments, improving the quality of human judgement has practical value. A systematic forecasting process offers a way to make assumptions more explicit, uncertainty more visible and performance more accountable.',
          },
          {
            type: 'p',
            text: 'It also creates the possibility of continuous improvement. When predictions are recorded and subsequently evaluated, forecasters can examine where their judgements were accurate and where they were mistaken. Over time, this provides a basis for identifying recurring errors and testing whether particular methods improve performance.',
          },
          {
            type: 'p',
            text: 'The use of probabilistic forecasts is particularly important in this respect. A binary record of success or failure provides limited information about the quality of a judgement. A forecaster who assigns a 51% probability to an event that occurs and one who assigns a 99% probability have both made a correct prediction, but their judgements are not equivalent. Probabilistic scoring preserves this distinction.',
          },
          {
            type: 'p',
            text: 'A consistent scoring framework also makes it possible to compare performance across individuals and across repeated forecasting exercises. This provides a foundation for studying how forecasting ability varies, how it responds to training and whether improvements are maintained over time.',
          },
          {
            type: 'p',
            text: 'However, better performance on a forecasting task should not automatically be equated with better decision-making in every context. Decisions also depend on the costs of different outcomes, the resources available and the consequences of acting or failing to act. Forecasting accuracy is an important component of good judgement, but it is not the only one.',
          },
          {
            type: 'p',
            text: 'The next step is therefore to establish not only whether training improves forecasting scores, but also how durable those improvements are, which elements of the training contribute most and whether the effects transfer to different types of questions and real-world decisions.',
          },
        ],
      },
      {
        id: 'future-directions-in-forecasting-research',
        heading: 'Future directions in forecasting research',
        blocks: [
          {
            type: 'p',
            text: 'The present study provides a starting point for a broader programme of research into the development of human forecasting ability.',
          },
          {
            type: 'p',
            text: 'Several questions remain.',
          },
          {
            type: 'p',
            text: 'First, the durability of training effects needs to be established. An improvement immediately following instruction does not necessarily mean that participants will continue to perform better months or years later. Longitudinal studies could examine whether participants retain the methods they have learned and whether their performance changes with repeated practice.',
          },
          {
            type: 'p',
            text: 'Second, it is necessary to understand which parts of the training are most effective. The intervention combined several principles: probabilistic framing, base-rate reasoning, information evaluation and performance measurement. The present comparison evaluates the training as a whole. Further studies could isolate individual components to determine whether some techniques contribute more than others.',
          },
          {
            type: 'p',
            text: 'Third, the generalisability of the findings requires investigation. Forecasting questions vary considerably. Predicting economic indicators, political developments, scientific milestones and everyday events may require different kinds of knowledge and reasoning. A training method that improves performance in one domain may not have the same effect in another.',
          },
          {
            type: 'p',
            text: "Finally, future research should examine the relationship between practice and performance. Repeated forecasting creates opportunities for feedback, but improvement should be demonstrated through measured outcomes rather than assumed. A participant's score may change because of learning, differences in question difficulty or chance. Research designs must distinguish these possibilities.",
          },
          {
            type: 'p',
            text: 'A larger and more systematic programme could combine controlled training interventions with repeated forecasting exercises, allowing researchers to examine the development of forecasting performance over time. Such work would help establish whether forecasting is a generalisable skill, how it can best be taught and under what conditions training produces lasting improvements.',
          },
        ],
      },
      {
        id: 'conclusion',
        heading: 'Conclusion',
        blocks: [
          {
            type: 'p',
            text: 'The future is uncertain, but the process by which people make predictions about it can be studied systematically.',
          },
          {
            type: 'p',
            text: 'For too long, forecasting has often been treated as an intuitive activity, evaluated informally and remembered selectively. Probabilistic forecasting provides a more rigorous alternative. It requires people to define the events they are predicting, express uncertainty numerically and evaluate their judgements against subsequent outcomes.',
          },
          {
            type: 'p',
            text: 'The study presented here examines whether this approach can be taught. In the illustrative results, participants who received structured forecasting instruction performed measurably better than those who did not. If confirmed by the actual study data, this finding would provide evidence that human forecasting performance is not simply fixed, and that methods for reasoning under uncertainty can be learned.',
          },
          {
            type: 'p',
            text: 'The result does not mean that the future can be predicted with certainty, nor that training eliminates the limits imposed by incomplete information and unpredictable events. It suggests something more practical: people can become better at judging what is likely to happen, provided they are given appropriate methods and opportunities to apply them.',
          },
          {
            type: 'p',
            text: 'This distinction matters. The objective of forecasting is not to remove uncertainty, but to reason more effectively in its presence. By making predictions explicit, measurable and open to evaluation, it becomes possible to move beyond intuition alone and towards a more disciplined science of human judgement.',
          },
          {
            type: 'p',
            text: 'The future will always contain events that surprise us. But our ability to anticipate those events need not remain a matter of instinct. It can be measured, studied and improved.',
          },
        ],
      },
    ],
  },
}

export function articleContent(item: ResearchItem): ArticleContent | null {
  const authored = AUTHORED_ARTICLES[researchSlug(item.href)]
  if (!authored) return null
  return {
    lead: authored.lead,
    intro: authored.intro ?? [],
    sections: withSentenceCaseHeadings(authored.sections),
    authors: feedAuthors(item),
  }
}
