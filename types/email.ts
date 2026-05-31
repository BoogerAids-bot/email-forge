export type EmailBlockType = 'hero_image' | 'heading' | 'body_text' | 'cta_button' | 'divider';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: Record<string, any>;
  style: Record<string, any>;
}
