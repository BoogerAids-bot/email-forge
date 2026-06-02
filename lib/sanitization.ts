import { EmailBlock, EmailBlockType } from "@/types/email";

const VALID_BLOCK_TYPES: EmailBlockType[] = [
  'hero_image',
  'heading',
  'body_text',
  'cta_button',
  'divider'
];

export function sanitizeBlocks(blocks: unknown): EmailBlock[] {
  if (!Array.isArray(blocks)) {
    console.warn("sanitizeBlocks: Input is not an array. Returning empty array.");
    return [];
  }

  const sanitized: EmailBlock[] = [];

  blocks.forEach((item, index) => {
    const block = item as EmailBlock;
    
    // 1. Filter out invalid types
    if (!block || !VALID_BLOCK_TYPES.includes(block.type)) {
      console.warn(`sanitizeBlocks: Dropping block at index ${index} due to invalid type: ${block?.type}`);
      return;
    }

    const repairedBlock: EmailBlock = {
      id: block.id,
      type: block.type,
      content: block.content,
      style: block.style,
    };

    let repaired = false;

    // 2. Ensure content and style are objects
    if (typeof repairedBlock.content !== 'object' || repairedBlock.content === null) {
      repairedBlock.content = {};
      repaired = true;
    }

    if (typeof repairedBlock.style !== 'object' || repairedBlock.style === null) {
      repairedBlock.style = {};
      repaired = true;
    }

    // 3. Ensure id is a non-empty string
    if (typeof repairedBlock.id !== 'string' || repairedBlock.id.trim() === '') {
      repairedBlock.id = crypto.randomUUID();
      repaired = true;
    }

    if (repaired) {
      console.warn(`sanitizeBlocks: Repaired block of type ${repairedBlock.type} at index ${index}`);
    }

    sanitized.push(repairedBlock);
  });

  return sanitized;
}
