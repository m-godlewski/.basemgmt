import type { Item, ItemCreateRequest, ItemResponse } from '../types/item';

// backend API url
const API_URL = 'http://localhost:8000/api';

// utility function for making API requests to the backend, handles response parsing and error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

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
        return apiRequest<Item[]>(`/items/?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get a single item by ID
     */
    getById: async (id: number): Promise<Item> => {
        return apiRequest<Item>(`/items/${id}`);
    },

    /**
     * Create a new item
     */
    create: async (data: ItemCreateRequest): Promise<ItemResponse> => {
        return apiRequest<ItemResponse>('/items/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update an item
     */
    update: async (id: number, data: Partial<ItemCreateRequest>): Promise<ItemResponse> => {
        return apiRequest<ItemResponse>(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete an item
     */
    delete: async (id: number): Promise<void> => {
        await apiRequest<void>(`/items/${id}`, {
            method: 'DELETE',
        });
    },
};
