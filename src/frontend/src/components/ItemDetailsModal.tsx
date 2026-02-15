import Dialog from "@mui/material/Dialog";
import type { Item } from "../data/item";
import { useEffect, useState } from 'react';
import { DialogContent, DialogTitle, DialogActions, Button, CircularProgress, Typography, Box } from "@mui/material";
import { itemsClient } from '../api/client';

// predefined props for ItemDetailsModal component
interface ItemDetailsModalProps {
    open: boolean;
    onClose: () => void;
    item: Item;
}

export default function ItemDetailsModal({ open, onClose, item }: ItemDetailsModalProps) {
    // state that holds URL of the loaded image, if any
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    // loading state
    const [loading, setLoading] = useState(false);
    // error state
    const [error, setError] = useState<string | null>(null);

    // effect that loads item image when modal is opened and item has an image, and cleans up object URL on close
    useEffect(() => {
        let objectUrl: string | null = null;
        // inner method that loads image from backend
        async function loadImage() {
            if (!open) return;
            if (!item?.has_image) return;
            setLoading(true);
            setError(null);
            try {
                const blob = await itemsClient.getImage(item.id);
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load image');
            } finally {
                setLoading(false);
            }
        }
        loadImage();
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setImageUrl(null);
            setError(null);
        };
    }, [open, item]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* item name */}
            <DialogTitle>{item.name}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {/* item description */}
                {item.description && (
                    <Typography variant="body2">{item.description}</Typography>
                )}
                {/* item image */}
                {item.has_image ? (
                    loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : imageUrl ? (
                        <Box component="img" src={imageUrl} alt={item.name} sx={{ width: '100%', height: 'auto', maxHeight: 480, objectFit: 'contain' }} />
                    ) : (
                        <Typography variant="caption">No image available.</Typography>
                    )
                ) : (
                    <Typography variant="caption">This item has no image.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}