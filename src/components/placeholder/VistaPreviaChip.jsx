import { Chip } from '@mui/material';
import MaterialSymbol from '../MaterialSymbol';

const Icon = MaterialSymbol;

// Distingue una pantalla de maquetado (datos de ejemplo) de un modulo ya conectado al backend.
export default function VistaPreviaChip() {
    return (
        <Chip
            icon={<Icon name="construction" size={14} color="#92400e" />}
            label="Vista previa · datos de ejemplo"
            size="small"
            sx={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontWeight: 700,
                mb: 2,
            }}
        />
    );
}
