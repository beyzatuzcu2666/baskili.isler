import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


const initialOrders = [
    {
        id: 1,
        siparisAlan: 'Beyza Tuzcu',
        marka: 'Say Cheese',
        numuneDurumu: 'Verildi',
        siparisDurumu: 'Onay Bekleniyor',
        teslimatDurumu: '-',
    },
];

const Orders = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        siparisAlan: '',
        marka: '',
        numuneDurumu: '',
        siparisDurumu: '',
        teslimatDurumu: '',
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.siparisAlan.toLowerCase().includes(searchTerm) ||
            order.marka.toLowerCase().includes(searchTerm)
    );

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewOrder({
            siparisAlan: '',
            marka: '',
            numuneDurumu: '',
            siparisDurumu: '',
            teslimatDurumu: '',
        });
    };

    const handleDelete = (id: number) => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const orderWithId = { ...newOrder, id: orders.length + 1 };
        setOrders([...orders, orderWithId]);
        handleClose();
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Siparişler
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Ara"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Sipariş Ekle
                </Button>
            </Box>

            {/* Modal */}
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Yeni Sipariş Ekle</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        name="siparisAlan"
                        label="Sipariş Alan"
                        value={newOrder.siparisAlan}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        name="marka"
                        label="Marka"
                        value={newOrder.marka}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        name="numuneDurumu"
                        label="Numune Durumu"
                        select
                        value={newOrder.numuneDurumu}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Bekliyor">Verildi</MenuItem>
                        <MenuItem value="Gönderildi">Verilmedi</MenuItem>
                    </TextField>
                    <TextField
                        name="siparisDurumu"
                        label="Sipariş Durumu"
                        select
                        value={newOrder.siparisDurumu}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Hazırlanıyor">Onay Bekleniyor</MenuItem>
                        <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                        <MenuItem value="Tamamlandı">Sipariş Alındı</MenuItem>
                        <MenuItem value="Tamamlandı">Teklif Verildi</MenuItem>
                    </TextField>
                    <TextField
                        name="teslimatDurumu"
                        label="Teslimat Durumu"
                        select
                        value={newOrder.teslimatDurumu}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                        <MenuItem value="Teslim Edildi">Teslim Edildi</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tablo */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff' }}>Sipariş Alan</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Marka</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Numune Durumu</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Sipariş Durumu</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Teslimat Durumu</TableCell>
                            <TableCell sx={{ color: '#fff' }}>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.siparisAlan}</TableCell>
                                <TableCell>{order.marka}</TableCell>
                                <TableCell>{order.numuneDurumu}</TableCell>
                                <TableCell>{order.siparisDurumu}</TableCell>
                                <TableCell>{order.teslimatDurumu}</TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleDelete(order.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Sonuç bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Orders;

