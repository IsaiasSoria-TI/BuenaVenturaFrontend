import * as React from 'react';
import PropTypes from 'prop-types';

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

export default function ModalProveedor({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    serverError,
    serverSuccess,
    tiposProveedor,
    bancos,
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
                    {serverError ? <Alert severity="error">{serverError}</Alert> : null}
                    {serverSuccess ? <Alert severity="success">{serverSuccess}</Alert> : null}

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
                            value={form.ruc || ''}
                            onChange={onChange('ruc')}
                            error={Boolean(errors.ruc)}
                            helperText={errors.ruc || ''}
                            slotProps={{
                                htmlInput: { maxLength: 11 },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Razón social"
                            value={form.razonSocial || ''}
                            onChange={onChange('razonSocial')}
                            error={Boolean(errors.razonSocial)}
                            helperText={errors.razonSocial || ''}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Tipo de proveedor"
                            value={form.idTipoProveedor || ''}
                            onChange={onChange('idTipoProveedor')}
                            error={Boolean(errors.idTipoProveedor)}
                            helperText={errors.idTipoProveedor || ''}
                        >
                            <MenuItem value="">
                                <em>Seleccione</em>
                            </MenuItem>

                            {tiposProveedor.map((tipo) => (
                                <MenuItem key={tipo.idTipoProveedor} value={tipo.idTipoProveedor}>
                                    {tipo.nombre}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Teléfono"
                            value={form.telefono || ''}
                            onChange={onChange('telefono')}
                            error={Boolean(errors.telefono)}
                            helperText={errors.telefono || ''}
                            slotProps={{
                                htmlInput: { maxLength: 9 },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Correo"
                            value={form.correo || ''}
                            onChange={onChange('correo')}
                            error={Boolean(errors.correo)}
                            helperText={errors.correo || ''}
                        />
                        <TextField
                            fullWidth
                            label="Dirección"
                            value={form.direccion || ''}
                            onChange={onChange('direccion')}
                            error={Boolean(errors.direccion)}
                            helperText={errors.direccion || ''}
                        />

                        <TextField
                            fullWidth
                            label="Departamento"
                            value={form.departamento || ''}
                            onChange={onChange('departamento')}
                            error={Boolean(errors.departamento)}
                            helperText={errors.departamento || ''}
                        />

                        <TextField
                            fullWidth
                            label="Provincia"
                            value={form.provincia || ''}
                            onChange={onChange('provincia')}
                            error={Boolean(errors.provincia)}
                            helperText={errors.provincia || ''}
                        />

                        <TextField
                            fullWidth
                            label="Representante"
                            value={form.representante || ''}
                            onChange={onChange('representante')}
                            error={Boolean(errors.representante)}
                            helperText={errors.representante || ''}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Banco"
                            value={form.idBanco || ''}
                            onChange={onChange('idBanco')}
                            error={Boolean(errors.idBanco)}
                            helperText={errors.idBanco || ''}
                            slotProps={{
                                select: {
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 280,
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>Seleccione</em>
                            </MenuItem>

                            {bancos.map((banco) => (
                                <MenuItem key={banco.idBanco} value={banco.idBanco}>
                                    {banco.nombre}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Cuenta bancaria"
                            value={form.cuentaBancaria || ''}
                            onChange={onChange('cuentaBancaria')}
                            error={Boolean(errors.cuentaBancaria)}
                            helperText={errors.cuentaBancaria || ''}
                        />

                        <TextField
                            fullWidth
                            label="Cuenta interbancaria"
                            value={form.cuentaInterbancaria || ''}
                            onChange={onChange('cuentaInterbancaria')}
                            error={Boolean(errors.cuentaInterbancaria)}
                            helperText={errors.cuentaInterbancaria || ''}
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

ModalProveedor.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    form: PropTypes.shape({
        ruc: PropTypes.string,
        razonSocial: PropTypes.string,
        idTipoProveedor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        telefono: PropTypes.string,
        correo: PropTypes.string,
        direccion: PropTypes.string,
        representante: PropTypes.string,
        departamento: PropTypes.string,
        provincia: PropTypes.string,
        idBanco: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        cuentaBancaria: PropTypes.string,
        cuentaInterbancaria: PropTypes.string,
    }).isRequired,
    errors: PropTypes.objectOf(PropTypes.string).isRequired,
    saving: PropTypes.bool.isRequired,
    serverError: PropTypes.string,
    serverSuccess: PropTypes.string,
    tiposProveedor: PropTypes.arrayOf(
        PropTypes.shape({
            idTipoProveedor: PropTypes.number,
            nombre: PropTypes.string,
        })
    ).isRequired,
    bancos: PropTypes.arrayOf(
        PropTypes.shape({
            idBanco: PropTypes.number,
            nombre: PropTypes.string,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

ModalProveedor.defaultProps = {
    serverError: '',
    serverSuccess: '',
};
