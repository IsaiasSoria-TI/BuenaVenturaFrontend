import React from 'react';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import PerfilForm from './PerfilForm';
import FormSkeleton from '../../../../components/loading/FormSkeleton';
import { configuracionService } from '../../../../services/configuracionService';
import { getUser, updateUser } from '../../../../services/sessionService';
import { useAutoClearMessage } from '../../../../utils/useAutoClearMessage';
import { getApiErrorMessage } from '../../../../utils/getApiErrorMessage';

// Estado base del perfil antes de cargar los datos del backend.
const initialForm = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    telefono: '',
    correo: '',
};

function getUsuarioIdActual() {
    return getUser().idUsuario;
}

// Sincroniza localStorage para que Topbar muestre el nombre actualizado sin reloguear.
function actualizarUsuarioLocal(data) {
    updateUser({
        usuario: data.usuario || '',
        nombreCompleto: data.nombreCompleto || '',
    });
}

export default function PerfilSection() {
    const [form, setForm] = React.useState(initialForm);
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [serverError, setServerError] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    useAutoClearMessage(successMessage, setSuccessMessage);

    // Carga los datos del usuario autenticado para llenar el formulario.
    const cargarPerfil = React.useCallback(async () => {
        try {
            setLoading(true);
            setServerError('');

            const usuarioId = getUsuarioIdActual();

            if (!usuarioId) {
                throw new Error('No se encontro el id del usuario actual.');
            }

            const data = await configuracionService.obtenerPerfil(usuarioId);

            setForm({
                nombres: data.nombres || '',
                apellidoPaterno: data.apellidoPaterno || '',
                apellidoMaterno: data.apellidoMaterno || '',
                usuario: data.usuario || '',
                telefono: data.telefono || '',
                correo: data.correo || '',
            });
        } catch (error) {

            setServerError(getApiErrorMessage(error, 'No se pudo cargar la informacion del perfil.'));
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
        // Validaciones de cliente: evitan requests con campos obligatorios incompletos.
        const newErrors = {};

        if (!form.nombres.trim()) {
            newErrors.nombres = 'Los nombres son obligatorios';
        }

        if (!form.apellidoPaterno.trim()) {
            newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
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

            const usuarioId = getUsuarioIdActual();

            if (!usuarioId) {
                throw new Error('No se encontro el id del usuario actual.');
            }

            // El backend espera datos limpios, por eso se aplica trim antes de enviar.
            const payload = {
                nombres: form.nombres.trim(),
                apellidoPaterno: form.apellidoPaterno.trim(),
                apellidoMaterno: form.apellidoMaterno.trim(),
                usuario: form.usuario.trim(),
                telefono: form.telefono.trim(),
                correo: form.correo.trim(),
            };

            const data = await configuracionService.actualizarPerfil(usuarioId, payload);

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

            setServerError(getApiErrorMessage(error, 'No se pudo actualizar el perfil.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box aria-busy="true">
                <Box sx={{ mb: 2 }} aria-hidden="true">
                    <Skeleton animation="wave" width={90} height={28} />
                    <Skeleton animation="wave" width={260} height={22} />
                </Box>
                <FormSkeleton fields={6} />
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
