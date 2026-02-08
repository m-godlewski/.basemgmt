import { z } from 'zod';

/*
* Interfaces
*/
export interface Item {
    id: number;
    name: string;
    description?: string;
    has_image?: boolean;
}

export interface ItemResponse extends Item { }

/*
* Zod Schemas
*/
export const ItemCreateSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .min(3, 'Name has to be at least 3 characters long')
        .max(100, 'Name cannot be longer than 100 characters')
        .trim(),
    description: z.string()
        .max(500, 'Description cannot be longer than 500 characters')
        .trim()
        .optional(),
    image: z.instanceof(File)
        .optional()
});


/*
* Types
*/
export type ItemCreateRequest = z.infer<typeof ItemCreateSchema>;
