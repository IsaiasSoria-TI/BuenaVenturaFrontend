import React from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import PerfilForm from './PerfilForm';
import { configuracionService } from '../../../../services/configuracionService';

const initialForm = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    telefono: '',
    correo: '',
};

function actualizarUsuarioLocal(data) {
    const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');

    const nuevoUsuario = {
        ...usuarioActual,
        usuario: data.usuario || '',
        nombreCompleto: data.nombreCompleto || '',
    };

    localStorage.setItem('user', JSON.stringify(nuevoUsuario));
    window.dispatchEvent(new Event('user-updated'));
}

export default function PerfilSection() {
    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [serverError, setServerError] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const cargarPerfil = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');

            const data = await configuracionService.obtenerPerfil();

            setForm({
                nombres: data.nombres || '',
                apellidoPaterno: data.apellidoPaterno || '',
                apellidoMaterno: data.apellidoMaterno || '',
                usuario: data.usuario || '',
                telefono: data.telefono || '',
                correo: data.correo || '',
            });
        } catch (error) {
            console.error('Error al cargar perfil:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo cargar la información del perfil.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo cargar la información del perfil.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        cargarPerfil();
    }, [cargarPerfil]);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }

        if (serverError) {
            setServerError('');
        }

        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.nombres.trim()) {
            newErrors.nombres = 'Los nombres son obligatorios';
        }

        if (!form.apellidoPaterno.trim()) {
            newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
        }

        if (!form.apellidoMaterno.trim()) {
            newErrors.apellidoMaterno = 'El apellido materno es obligatorio';
        }

        if (!form.usuario.trim()) {
            newErrors.usuario = 'El usuario es obligatorio';
        }

        if (form.telefono && !/^[0-9]{9}$/.test(form.telefono.trim())) {
            newErrors.telefono = 'El teléfono debe tener 9 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            setServerError('');
            setSuccessMessage('');

            const payload = {
                nombres: form.nombres.trim(),
                apellidoPaterno: form.apellidoPaterno.trim(),
                apellidoMaterno: form.apellidoMaterno.trim(),
                usuario: form.usuario.trim(),
                telefono: form.telefono.trim(),
                correo: form.correo.trim(),
            };

            const data = await configuracionService.actualizarPerfil(payload);

            setForm({
                nombres: data.nombres || '',
                apellidoPaterno: data.apellidoPaterno || '',
                apellidoMaterno: data.apellidoMaterno || '',
                usuario: data.usuario || '',
                telefono: data.telefono || '',
                correo: data.correo || '',
            });

            actualizarUsuarioLocal(data);
            setSuccessMessage('Perfil actualizado correctamente.');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'No se pudo actualizar el perfil.';

            setServerError(
                typeof message === 'string'
                    ? message
                    : 'No se pudo actualizar el perfil.'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 6,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                    Perfil
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Actualiza tu información personal.
                </Typography>
            </Box>

            {serverError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            ) : null}

            {successMessage ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            ) : null}

            <PerfilForm
                form={form}
                errors={errors}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        </Box>
    );
}