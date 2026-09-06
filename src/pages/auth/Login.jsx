import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/BUENAVENTURA SAC.png';
import { login } from '../../services/authService';
import { saveSession } from '../../services/sessionService';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const textFieldSx = {
    '& .MuiInputLabel-outlined': {
        transform: 'translate(14px, 14px) scale(1)',
    },
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: 1.5,
        backgroundColor: '#fbfdff',
        '& input': {
            paddingTop: '8px',
            paddingBottom: '14px',
            fontSize: '0.98rem',
        },
    },
};

const passwordFieldSx = {
    ...textFieldSx,
    '& input::-ms-reveal, & input::-ms-clear': {
        display: 'none',
    },
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = React.useState({
        usuario: '',
        contrasena: '',
    });
    const [errorMessage, setErrorMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handlePasswordMouseDown = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const usuario = form.usuario.trim();
        const contrasena = form.contrasena;

        if (!usuario || !contrasena.trim()) {
            setErrorMessage('Ingresa usuario y contrasena');
            return;
        }

        try {
            setLoading(true);
            const response = await login(usuario, contrasena);
            const { token, ...user } = response;

            saveSession(token, user);

            navigate('/dashboard', { replace: true });
        } catch (error) {
            if (!error.response) {
                setErrorMessage('No se pudo conectar con el backend');
                return;
            }

            const status = error.response.status;

            if (status === 503) {
                setErrorMessage(
                    error.response.data?.message
                    || 'El servicio no puede consultar la base de datos en este momento'
                );
                return;
            }

            if (status >= 500) {
                setErrorMessage('El servidor no esta disponible en este momento');
                return;
            }

            if (status === 403) {
                setErrorMessage('La solicitud fue rechazada por la configuracion del servidor');
                return;
            }

            setErrorMessage('Usuario o contrasena incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 3 },
                py: 4,
                backgroundColor: '#f4f7fb',
            }}
        >
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 410,
                    borderRadius: 2,
                    border: '1px solid #d8e0ea',
                    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.10)',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                }}
            >
                {/* Contenido interno de la tarjeta: logo, textos y formulario. */}
                <CardContent
                    sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 3.5, sm: 4 },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3,
                        }}
                    >
                        <Box
                            component="img"
                            src={logoImg}
                            alt="Logo Buenaventura"
                            sx={{
                                width: 220,
                                maxWidth: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: '#0f172a',
                            mb: 0.75,
                            fontSize: { xs: '1.65rem', sm: '1.85rem' },
                            lineHeight: 1.2,
                        }}
                    >
                        Acceso al sistema
                    </Typography>

                    <Typography
                        sx={{
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '0.95rem',
                            mb: 3,
                        }}
                    >
                        Ingresa tus credenciales para continuar
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Usuario"
                            name="usuario"
                            value={form.usuario}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            autoComplete="username"
                            disabled={loading}
                            sx={{
                                mb: 1.5,
                                ...textFieldSx,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Contrasena"
                            name="contrasena"
                            type={showPassword ? 'text' : 'password'}
                            value={form.contrasena}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            autoComplete="current-password"
                            disabled={loading}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                                aria-pressed={showPassword}
                                                onClick={handleTogglePassword}
                                                onMouseDown={handlePasswordMouseDown}
                                                edge="end"
                                                sx={{ color: '#64748b' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                mb: 1,
                                ...passwordFieldSx,
                            }}
                        />

                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            disabled={loading}
                            sx={{
                                py: 1.35,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                backgroundColor: '#2563eb',
                                boxShadow: '0 10px 22px rgba(37, 99, 235, 0.22)',
                                '&:hover': {
                                    backgroundColor: '#1d4ed8',
                                    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.26)',
                                },
                            }}
                        >
                            {loading ? 'Ingresando...' : 'Iniciar sesion'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
