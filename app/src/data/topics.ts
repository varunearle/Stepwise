import evaluation from './evaluation.json';
import type { BktParams } from '../lib/bkt';

export type TopicId = 'arrays' | 'lists' | 'stacks' | 'trees' | 'sorting' | 'complexity';

export interface Topic {
  id: TopicId;
  name: string;
  short: string;
}

// Course order. Used to break ties when recommending what to practise next.
export const TOPICS: Topic[] = [
  { id: 'arrays', name: 'Arrays & Strings', short: 'Arrays' },
  { id: 'lists', name: 'Linked Lists', short: 'Linked lists' },
  { id: 'stacks', name: 'Stacks & Queues', short: 'Stacks & queues' },
  { id: 'trees', name: 'Trees', short: 'Trees' },
  { id: 'sorting', name: 'Sorting', short: 'Sorting' },
  { id: 'complexity', name: 'Time Complexity', short: 'Complexity' },
];

export const topicName = (id: TopicId) => TOPICS.find((t) => t.id === id)!.name;

// Starting parameters, used for every topic until the course has its own
// attempts to refit on (Model page → "Refit from logged attempts").
// The reasons are shown on the Model page.
export const DEFAULT_PARAMS: BktParams = {
  prior: 0.2,  // topics are new material for most students
  learn: 0.15, // inside the middle 50% of values fitted on ASSISTments
  guess: 0.25, // one in four: every question has four options
  slip: 0.1,   // a student who knows the topic should rarely miss
};

export const PARAM_REASONS: Record<keyof BktParams, string> = {
  prior: 'Course topics are new material for most students, so the starting estimate is low.',
  learn: 'Within the middle 50% of values fitted on ASSISTments (' +
    evaluation.param_quartiles.learn[0] + ' to ' + evaluation.param_quartiles.learn[2] + ').',
  guess: 'Every question has four options, so a student who has not learned the topic picks the right one about one time in four.',
  slip: 'A student who has learned the topic should rarely answer wrongly.',
};

export const defaultParamsByTopic = (): Record<TopicId, BktParams> =>
  Object.fromEntries(TOPICS.map((t) => [t.id, { ...DEFAULT_PARAMS }])) as Record<TopicId, BktParams>;
