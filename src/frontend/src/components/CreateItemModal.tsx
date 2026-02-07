import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Box,
    Typography,
} from '@mui/material';
import { itemsClient } from '../api/client';
import { ItemCreateSchema } from '../types/item';
import type { ItemCreateRequest } from '../types/item';
import { ZodError } from 'zod';

// field configuration interface
interface FieldConfig {
    name: keyof ItemCreateRequest;
    label: string;
    placeholder: string;
    type?: 'text' | 'textarea' | 'email' | 'number';
    multiline?: boolean;
    rows?: number;
}

// form fields configuration for item creation
const itemFormFields: FieldConfig[] = [
    {
        name: 'name',
        label: 'Item name',
        placeholder: 'Box, Towel, etc.',
        type: 'text',
    },
];

// predefined props for CreateItemModal component
interface CreateItemModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// initial state for form
const initialFormState: ItemCreateRequest = {
    name: '',
};

/*
*
* TODO
* 
*/
export default function CreateItemModal({ open, onClose, onSuccess }: CreateItemModalProps) {
    // state for form data
    const [formData, setFormData] = useState<ItemCreateRequest>(initialFormState);
    const [loading, setLoading] = useState(false);
    // store field-specific errors
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    // handles input changes and updates form state
    const handleInputChange = (field: keyof ItemCreateRequest, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    // validates form data using zod schema
    const validateForm = (): boolean => {
        try {
            ItemCreateSchema.parse(formData);
            setFieldErrors({});
            return true;
        } catch (err) {
            if (err instanceof ZodError) {
                const errors: Record<string, string> = {};
                err.issues.forEach((error) => {
                    const fieldName = error.path[0] as string;
                    errors[fieldName] = error.message;
                });
                setFieldErrors(errors);
            }
            return false;
        }
    };

    // method that handles form submission
    // sends create request to backend and handles response
    const handleSubmit = async () => {
        setGeneralError('');
        // checks whether form data is valid before sending request
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            await itemsClient.create(formData);
            setFormData(initialFormState);
            onClose();
            onSuccess?.();
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'Error while adding item');
        } finally {
            setLoading(false);
        }
    };

    // handles modal close action, resets form state and error messages
    const handleClose = () => {
        setFormData(initialFormState);
        setFieldErrors({});
        setGeneralError('');
        onClose();
    };

    // flag that determines if form is valid
    const isFormValid = Object.keys(fieldErrors).length === 0 && Object.values(formData).every(val => val?.toString().trim().length > 0);

    // renders modal dialog with item creation forms
    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add new item</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {/* error message */}
                {generalError && <Alert severity="error">{generalError}</Alert>}
                {/* iterates over object properties and renders form field */}
                {itemFormFields.map((field) => (
                    <Box key={field.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                            {field.label}
                        </Typography>
                        <TextField
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            variant="outlined"
                            disabled={loading}
                            error={!!fieldErrors[field.name]}
                            helperText={fieldErrors[field.name]}
                            type={field.type || 'text'}
                            multiline={field.multiline}
                            rows={field.rows}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                ))}
            </DialogContent>
            {/* action buttons */}
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || !isFormValid}
                >
                    {loading ? 'Adding...' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
