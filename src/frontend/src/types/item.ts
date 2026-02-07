import { z } from 'zod';

export interface Item {
    id: number;
    name: string;
}

export interface ItemResponse extends Item {}

// zod schema for item creation validation
export const ItemCreateSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .min(3, 'Name has to be at least 3 characters long')
        .max(100, 'Name cannot be longer than 100 characters')
        .trim(),
});

export type ItemCreateRequest = z.infer<typeof ItemCreateSchema>;
