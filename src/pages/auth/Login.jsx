import * as React from 'react';
import logoImg from '../../assets/BUENAVENTURA SAC.png';
import { login } from '../../services/authService';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
} from '@mui/material';

export default function LoginPage() {
    // Guarda los valores que el usuario escribe en el formulario.
    const [form, setForm] = React.useState({
        usuario: '',
        contrasena: '',
        remember: false,
    });

    // Muestra un mensaje cuando el inicio de sesion falla.
    const [errorMessage, setErrorMessage] = React.useState('');

    // Actualiza el estado del formulario cada vez que cambia un campo.
    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Envia las credenciales al backend y redirige al dashboard si son correctas.
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        try {
            const response = await login(form.usuario, form.contrasena);
            const { token, ...user } = response;

            localStorage.setItem('token', token);
            localStorage.setItem('username', user.nombreCompleto || user.usuario);
            localStorage.setItem('user', JSON.stringify(user));

            window.location.href = '/dashboard';
        } catch {
            setErrorMessage('Usuario o contrasena incorrectos');
        }
    };

    return (
        // Contenedor principal que centra la tarjeta del login en la pantalla.
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
                        {/* Logo de la empresa mostrado encima del formulario. */}
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

                    {/* Titulo principal del login. */}
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

                    {/* Texto de ayuda para indicar que se deben ingresar credenciales. */}
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

                    {/* Formulario que captura usuario y contrasena. */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Campo para ingresar el usuario. */}
                        <TextField
                            fullWidth
                            label="Usuario"
                            name="usuario"
                            value={form.usuario}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            autoComplete="username"
                            sx={{
                                mb: 1.5,
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
                                        py: 1.35,
                                        fontSize: '0.98rem',
                                    },
                                },
                            }}
                        />

                        {/* Campo para ingresar la contrasena. */}
                        <TextField
                            fullWidth
                            label="Contrasena"
                            name="contrasena"
                            type="password"
                            value={form.contrasena}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            autoComplete="current-password"
                            sx={{
                                mb: 1,
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
                                        py: 1.35,
                                        fontSize: '0.98rem',
                                    },
                                },
                            }}
                        />

                        {/* Mensaje que aparece cuando las credenciales son incorrectas. */}
                        {errorMessage && (
                            <Typography
                                sx={{
                                    mb: 1.5,
                                    color: '#b91c1c',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                }}
                            >
                                {errorMessage}
                            </Typography>
                        )}

                        {/* Opcion visual para recordar sesion. */}
                        <Box
                            sx={{
                                mt: 0,
                                mb: 2.75,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="remember"
                                        checked={form.remember}
                                        onChange={handleChange}
                                        sx={{
                                            p: 0.75,
                                            mr: 0.5,
                                            color: '#64748b',
                                            '&.Mui-checked': {
                                                color: '#2563eb',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        sx={{
                                            fontSize: '0.92rem',
                                            color: '#334155',
                                        }}
                                    >
                                        Recordar sesion
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        </Box>

                        {/* Boton que envia el formulario de inicio de sesion. */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                py: 1.35,
                                borderRadius: 1.5,
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
                            Iniciar sesion
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
