import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

// Modal presentacional para crear/editar usuarios; la logica vive en SeguridadSection.
export default function ModalUsuarioSeguridad({
    open,
    onClose,
    editing,
    form,
    errors,
    saving,
    handleChange,
    handleSubmit,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editing ? 'Editar usuario' : 'Nuevo usuario'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Usuario"
                        fullWidth
                        value={form.usuario}
                        onChange={handleChange('usuario')}
                        error={!!errors.usuario}
                        helperText={errors.usuario}
                    />

                    <TextField
                        label={editing ? 'Nueva contrasena' : 'Contrasena'}
                        fullWidth
                        type="password"
                        value={form.contrasena}
                        onChange={handleChange('contrasena')}
                        error={!!errors.contrasena}
                        helperText={errors.contrasena || (editing ? 'Dejar vacio para mantener la actual' : '')}
                        autoComplete="new-password"
                    />

                    <TextField
                        label="Nombres"
                        fullWidth
                        value={form.nombres}
                        onChange={handleChange('nombres')}
                        error={!!errors.nombres}
                        helperText={errors.nombres}
                    />

                    <TextField
                        label="Apellido paterno"
                        fullWidth
                        value={form.apellidoPaterno}
                        onChange={handleChange('apellidoPaterno')}
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno}
                    />

                    <TextField
                        label="Apellido materno (opcional)"
                        fullWidth
                        value={form.apellidoMaterno}
                        onChange={handleChange('apellidoMaterno')}
                    />

                    <TextField
                        label="Telefono (opcional)"
                        fullWidth
                        value={form.telefono}
                        onChange={handleChange('telefono')}
                        error={!!errors.telefono}
                        helperText={errors.telefono}
                        slotProps={{ htmlInput: { maxLength: 9 } }}
                    />

                    <TextField
                        label="DNI (opcional)"
                        fullWidth
                        value={form.dni}
                        onChange={handleChange('dni')}
                        error={!!errors.dni}
                        helperText={errors.dni}
                        slotProps={{ htmlInput: { maxLength: 8 } }}
                    />

                    <TextField
                        label="Correo"
                        fullWidth
                        value={form.correo}
                        onChange={handleChange('correo')}
                        error={!!errors.correo}
                        helperText={errors.correo}
                    />

                    {editing && (
                        <TextField
                            select
                            label="Estado"
                            fullWidth
                            value={form.flgActivo}
                            onChange={handleChange('flgActivo')}
                        >
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </TextField>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>

                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
