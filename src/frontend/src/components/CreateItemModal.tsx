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
    styled,
} from '@mui/material';
import { z, ZodError } from 'zod';
import { itemsClient } from '../api/client';
import type { ItemCreateRequest } from '../data/item';
import { itemFormFields } from './ItemForm';

// Styled hidden input for file upload
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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

export default function CreateItemModal({ open, onClose, onSuccess }: CreateItemModalProps) {
    // state for form data
    const [formData, setFormData] = useState<ItemCreateRequest>(initialFormState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    // store field-specific errors
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    // handles input changes and updates form state for text fields
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

    // handles image file selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            // create preview URL for image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // validates form data using zod schema - name is required, image is optional
    const validateForm = (): boolean => {
        try {
            const dataToValidate = {
                name: formData.name,
                description: formData.description,
            };
            z.object({
                name: z.string()
                    .min(1, 'Name is required')
                    .min(3, 'Name has to be at least 3 characters long')
                    .max(100, 'Name cannot be longer than 100 characters')
                    .trim(),
                description: z.string()
                    .max(500, 'Description cannot be longer than 500 characters')
                    .trim()
                    .optional(),
            }).parse(dataToValidate);
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
            const submitData: ItemCreateRequest = {
                name: formData.name,
                description: formData.description,
            };
            if (imageFile) {
                submitData.image = imageFile;
            }
            // sends request to backend to create new item
            await itemsClient.create(submitData);
            setFormData(initialFormState);
            setImageFile(null);
            setImagePreview('');
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
        setImageFile(null);
        setImagePreview('');
        setFieldErrors({});
        setGeneralError('');
        onClose();
    };

    // flag that determines if form is valid (name must not be empty)
    const isFormValid = Object.keys(fieldErrors).length === 0 && formData.name?.trim().length > 0;

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
                        {field.type === "file" ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    disabled={loading}
                                >
                                    Choose Image
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                                {imageFile && (
                                    <Typography variant="body2">{imageFile.name}</Typography>
                                )}
                            </Box>
                        ) : (
                            <TextField
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                variant="outlined"
                                disabled={loading}
                                error={!!fieldErrors[field.name]}
                                helperText={fieldErrors[field.name]}
                                multiline={field.type === 'textarea'}
                                minRows={field.type === 'textarea' ? 3 : 1}
                                type={field.type || 'text'}
                                sx={{ flex: 1 }}
                            />
                        )}
                    </Box>
                ))}
                {/* Image preview */}
                {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Image Preview:</Typography>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} 
                        />
                    </Box>
                )}
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
