import { z } from 'zod';

export const EmailBlockTypeSchema = z.enum(['hero_image', 'heading', 'body_text', 'cta_button', 'divider']);
export type EmailBlockType = z.infer<typeof EmailBlockTypeSchema>;

export const BaseBlockSchema = z.object({
  id: z.string(),
});

export const HeroBlockSchema = BaseBlockSchema.extend({
  type: z.literal('hero_image'),
  content: z.object({
    imageUrl: z.string().url().default('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'),
  }).default({
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
  }),
  style: z.object({
    height: z.array(z.number()).default([200]),
    marginBottom: z.array(z.number()).default([24]),
  }).default({
    height: [200],
    marginBottom: [24]
  }),
});

export const HeadingBlockSchema = BaseBlockSchema.extend({
  type: z.literal('heading'),
  content: z.object({
    text: z.string().min(1).default('Elevate Your Brand'),
  }).default({
    text: 'Elevate Your Brand'
  }),
  style: z.object({
    color: z.string().default('#000000'),
    fontSize: z.array(z.number()).default([32]),
  }).default({
    color: '#000000',
    fontSize: [32]
  }),
});

export const BodyTextBlockSchema = BaseBlockSchema.extend({
  type: z.literal('body_text'),
  content: z.object({
    text: z.string().default(''),
  }).default({
    text: ''
  }),
  style: z.object({
    color: z.string().default('#444444'),
    fontSize: z.array(z.number()).default([16]),
  }).default({
    color: '#444444',
    fontSize: [16]
  }),
});

export const DividerBlockSchema = BaseBlockSchema.extend({
  type: z.literal('divider'),
  content: z.object({}).default({}),
  style: z.object({
    marginTop: z.array(z.number()).default([20]),
    marginBottom: z.array(z.number()).default([20]),
    color: z.string().default('#e5e7eb'),
  }).default({
    marginTop: [20],
    marginBottom: [20],
    color: '#e5e7eb'
  }),
});

export const CTABlockSchema = BaseBlockSchema.extend({
  type: z.literal('cta_button'),
  content: z.object({
    text: z.string().default('Click Me'),
    url: z.string().default('#'),
  }).default({
    text: 'Click Me',
    url: '#'
  }),
  style: z.object({
    backgroundColor: z.string().default('#000000'),
    textColor: z.string().default('#ffffff'),
    borderRadius: z.array(z.number()).default([6]),
  }).default({
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderRadius: [6]
  }),
});

export const EmailBlockSchema = z.discriminatedUnion('type', [
  HeroBlockSchema,
  HeadingBlockSchema,
  BodyTextBlockSchema,
  CTABlockSchema,
  DividerBlockSchema,
]);

export const EmailBlocksArraySchema = z.array(EmailBlockSchema);

export type EmailBlock = z.infer<typeof EmailBlockSchema>;

export function createBlock(type: EmailBlockType): EmailBlock {
  const id = `block-${Date.now()}`;
  switch (type) {
    case 'hero_image':
      return HeroBlockSchema.parse({ id, type });
    case 'heading':
      return HeadingBlockSchema.parse({ id, type });
    case 'body_text':
      return BodyTextBlockSchema.parse({ id, type });
    case 'cta_button':
      return CTABlockSchema.parse({ id, type });
    case 'divider':
      return DividerBlockSchema.parse({ id, type });
  }
}

