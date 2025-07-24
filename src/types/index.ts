export type WritingType = 'email' | 'blog' | 'story' | 'suggestion';
export type Tone = 'formal' | 'casual' | 'professional' | 'friendly';

export interface WritingOptions {
  type: WritingType;
  tone: Tone;
  content: string;
}