export type EmailBlockType = 'hero_image' | 'heading' | 'body_text' | 'cta_button' | 'divider';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: {
    text?: string;
    imageUrl?: string;
    url?: string;
    [key: string]: unknown;
  };
  style: {
    fontSize?: number[];
    color?: string;
    height?: number[];
    marginBottom?: number[];
    marginTop?: number[];
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number[];
    [key: string]: unknown;
  };
}
