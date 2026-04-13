import * as React from 'react';
import logoImg from '../../assets/logo.png';
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
    Link,
    Divider,
} from '@mui/material';

export default function LoginPage() {
    const [form, setForm] = React.useState({
        usuario: '',
        contrasena: '',
        remember: false,
    });

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await login(form.usuario, form.contrasena);
            localStorage.setItem('token', response.token);
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Usuario o contraseña incorrectos');
        }
    };
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                background: 'linear-gradient(180deg, #edf2f7 0%, #e7edf5 100%)',
            }}
        >
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 460,
                    borderRadius: 4,
                    border: '1px solid #d9e2ec',
                    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                }}
            >
                <Box
                    sx={{
                        px: 4,
                        pt: 4,
                        pb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Box
                        component="img"
                        src={logoImg}
                        alt="Logo"
                        sx={{
                            maxWidth: 180,
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                <Divider />

                <CardContent sx={{ px: 4, py: 4 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 0.75,
                            fontWeight: 600,
                            color: '#0f172a',
                            textAlign: 'center'
                        }}
                    >
                        Bienvenido
                    </Typography>

                    <Typography
                        sx={{
                            mb: 3,
                            fontSize: '0.95rem',
                            color: '#64748b',
                            textAlign: 'center'
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    '& input': {
                                        py: 1.8,
                                    },
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Contraseña"
                            name="contrasena"
                            type="password"
                            value={form.contrasena}
                            onChange={handleChange}
                            variant="outlined"
                            margin="normal"
                            autoComplete="current-password"
                            sx={{
                                mb: 1.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    backgroundColor: '#fff',
                                    '& input': {
                                        py: 1.8,
                                        fontSize: '1rem',
                                    },
                                },
                            }}
                        />

                        <Box
                            sx={{
                                mt: 0.5,
                                mb: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
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
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: '0.96rem', color: '#334155' }}>
                                        Recordar sesión
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                py: 1.45,
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontSize: '1.08rem',
                                fontWeight: 700,
                                backgroundColor: '#1976d2',
                                boxShadow: '0 10px 24px rgba(25, 118, 210, 0.22)',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                    boxShadow: '0 14px 28px rgba(25, 118, 210, 0.28)',
                                },
                            }}
                        >
                            Iniciar sesión
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                            <Link
                                href="#"
                                underline="hover"
                                sx={{
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    color: '#1976d2',
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}