import { EmailBlock, EmailBlocksArraySchema, EmailBlockSchema } from "@/types/email";

export function sanitizeBlocks(blocks: unknown): EmailBlock[] {
  if (!Array.isArray(blocks)) {
    console.warn("sanitizeBlocks: Input is not an array. Returning empty array.");
    return [];
  }

  const result = EmailBlocksArraySchema.safeParse(blocks);
  if (result.success) {
    return result.data;
  }

  // Attempt to recover valid blocks individually
  const sanitized: EmailBlock[] = [];
  blocks.forEach((item, index) => {
    const blockResult = EmailBlockSchema.safeParse(item);
    if (blockResult.success) {
      sanitized.push(blockResult.data);
    } else {
      console.warn(`sanitizeBlocks: Dropping block at index ${index} due to validation failure:`, blockResult.error);
    }
  });

  return sanitized;
}
