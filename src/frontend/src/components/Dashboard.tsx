import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Paper,
    Button,
} from '@mui/material';
import CreateItemModal from './CreateItemModal';
import { itemsClient } from '../api/client';
import type { Item } from '../types/item';
import logo from '../assets/logo.png';

/*
*
* Dashboard view.
* TODO
* 
*/
export default function Dashboard() {
    // state for modal creation
    const [openCreationModal, setOpenCreationModal] = useState(false);
    // state for items list
    const [items, setItems] = useState<Item[]>([]);
    // state for data loading
    const [loading, setLoading] = useState(true);
    // state for error handling
    const [error, setError] = useState('');

    // method that fetches list of available items from backend
    const fetchItems = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await itemsClient.getAll();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erorr while fetching items');
        } finally {
            setLoading(false);
        }
    };

    // fetches items on dashboard component mount
    useEffect(() => {
        fetchItems();
    }, []);

    // callback for successful item creation, refetches items list to update view
    const handleItemCreated = () => {
        fetchItems();
    };

    // renders dashboard component
    return (
        // main container
        <Container sx={{ width: "100%" }}>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                {/* app logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={logo} alt=".basemgmt logo" sx={{ height: 80 }} />
                </Box>
                {/* item creation button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenCreationModal(true)}
                >
                    New Item
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                // display loading spinner while data is being fetched
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                // if no items are available
                <Alert severity="info">No items.</Alert>
            ) : (
                // display items in a table
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {/* item creation modal */}
            <CreateItemModal
                open={openCreationModal}
                onClose={() => setOpenCreationModal(false)}
                onSuccess={handleItemCreated}
            />
        </Container>
    );
}
