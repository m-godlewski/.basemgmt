import type { ItemCreateRequest } from "../data/item";

// field configuration interface
export interface FieldConfig {
    name: keyof ItemCreateRequest;
    label: string;
    type?: 'text' | 'textarea' | 'number' | 'file';
}

// fields configuration for item creation form
export const itemFormFields: FieldConfig[] = [
    {
        name: 'name',
        label: 'Name',
        type: 'text',
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea',
    },
    {
        name: 'image',
        label: 'Image',
        type: 'file',
    }
];