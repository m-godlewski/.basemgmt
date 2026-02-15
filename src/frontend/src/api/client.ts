import type { Item, ItemCreateRequest, ItemResponse } from '../data/item';

// backend API url
const API_URL = 'http://localhost:8000/api';

// utility function for making API requests to the backend, handles response parsing and error handling
async function httpRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // makes fetch request to backend api to selected endpoint
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
    });
    // checks if response is successful
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `API error: ${response.status}`);
    }
    return response.json();
}

export const itemsClient = {
    /**
     * Get all items
     */
    getAll: async (skip: number = 0, limit: number = 100): Promise<Item[]> => {
        return httpRequest<Item[]>(`/items/?skip=${skip}&limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    /**
     * Get a single item by ID
     */
    getById: async (id: number): Promise<Item> => {
        return httpRequest<Item>(`/items/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    /**
     * Create a new item with optional image
     */
    create: async (data: ItemCreateRequest): Promise<ItemResponse> => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) {
            formData.append('description', data.description);
        }
        if (data.image) {
            formData.append('image', data.image);
        }
        return httpRequest<ItemResponse>('/items/', {
            method: 'POST',
            body: formData,
        });
    },

    /**
     * Update an item with optional image
     */
    update: async (id: number, data: Partial<ItemCreateRequest>): Promise<ItemResponse> => {
        const formData = new FormData();
        if (data.name) {
            formData.append('name', data.name);
        }
        if (data.description) {
            formData.append('description', data.description);
        }
        if (data.image) {
            formData.append('image', data.image);
        }
        return httpRequest<ItemResponse>(`/items/${id}`, {
            method: 'PUT',
            body: formData,
        });
    },

    /**
     * Delete an item
     */
    delete: async (id: number): Promise<void> => {
        await httpRequest<void>(`/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
};
