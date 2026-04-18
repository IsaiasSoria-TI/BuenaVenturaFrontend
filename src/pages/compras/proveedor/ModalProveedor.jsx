import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  MenuItem,
  Alert,
} from '@mui/material';

const BANCOS = [
    { id: 1, nombre: 'BCP' },
    { id: 2, nombre: 'BBVA' },
    { id: 3, nombre: 'Interbank' },
    { id: 4, nombre: 'Scotiabank' },
    { id: 5, nombre: 'Banco de la Nación' },
    { id: 6, nombre: 'Otros' },
];

export default function ModalProveedor({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    serverError,
    serverSuccess,
    onChange,
    onSubmit,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
                <Stack spacing={2}>
                    {serverError && <Alert severity="error">{serverError}</Alert>}
                    {serverSuccess && <Alert severity="success">{serverSuccess}</Alert>}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="RUC"
                            value={form.ruc}
                            onChange={onChange('ruc')}
                            error={!!errors.ruc}
                            helperText={errors.ruc}
                            inputProps={{ maxLength: 11 }}
                        />

                        <TextField
                            fullWidth
                            label="Razón social"
                            value={form.razonSocial}
                            onChange={onChange('razonSocial')}
                            error={!!errors.razonSocial}
                            helperText={errors.razonSocial}
                        />

                        <TextField
                            fullWidth
                            label="Teléfono"
                            value={form.telefono}
                            onChange={onChange('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono}
                            inputProps={{ maxLength: 9 }}
                        />

                        <TextField
                            fullWidth
                            label="Correo"
                            value={form.correo}
                            onChange={onChange('correo')}
                            error={!!errors.correo}
                            helperText={errors.correo}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Dirección"
                            value={form.direccion}
                            onChange={onChange('direccion')}
                            error={!!errors.direccion}
                            helperText={errors.direccion}
                        />

                        <TextField
                            fullWidth
                            label="Representante"
                            value={form.representante}
                            onChange={onChange('representante')}
                            error={!!errors.representante}
                            helperText={errors.representante}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Banco"
                            value={form.idBanco}
                            onChange={onChange('idBanco')}
                            error={!!errors.idBanco}
                            helperText={errors.idBanco}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 280,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>Seleccione</em>
                            </MenuItem>
                            {BANCOS.map((banco) => (
                                <MenuItem key={banco.id} value={banco.id}>
                                    {banco.nombre}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Cuenta bancaria"
                            value={form.cuentaBancaria}
                            onChange={onChange('cuentaBancaria')}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Cuenta interbancaria"
                            value={form.cuentaInterbancaria}
                            onChange={onChange('cuentaInterbancaria')}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving}
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}