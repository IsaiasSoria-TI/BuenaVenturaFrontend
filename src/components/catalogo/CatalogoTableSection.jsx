import PropTypes from 'prop-types';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import MaterialSymbol from '../MaterialSymbol';
import TableSkeletonRows from '../loading/TableSkeletonRows';

const Icon = MaterialSymbol;

// Layout comun para las tablas CRUD de Configuracion: tabla + paginacion + dialogo
// de confirmacion. Las columnas y el nombre del registro son lo unico que varia.
export default function CatalogoTableSection({
    columns,
    items,
    itemsPaginados,
    idField,
    loading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    serverError,
    success,
    createLabel,
    onCreate,
    onEdit,
    onDelete,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogText,
    onCloseDeleteDialog,
    onConfirmDelete,
    children,
}) {
    return (
        <Box>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" sx={{ mb: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={onCreate}
                            startIcon={<Icon name="add" size={18} color="#fff" />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            {createLabel}
                        </Button>
                    </Stack>

                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.header} align={column.align}>
                                            {column.header}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" sx={{ width: 112 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableSkeletonRows columns={columns.length + 1} />
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} align="center">
                                            Sin registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    itemsPaginados.map((item) => (
                                        <TableRow key={item[idField]}>
                                            {columns.map((column) => (
                                                <TableCell key={column.header} align={column.align}>
                                                    {column.render(item)}
                                                </TableCell>
                                            ))}
                                            <TableCell align="center" sx={{ width: 112 }}>
                                                <IconButton onClick={() => onEdit(item)} sx={{ width: 36, height: 36 }}>
                                                    <Icon name="edit" size={20} color="#1976d2" />
                                                </IconButton>
                                                <IconButton onClick={() => onDelete(item)} sx={{ width: 36, height: 36 }}>
                                                    <Icon name="delete" size={20} color="#ef4444" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {!loading && items.length > 0 && (
                            <TablePagination
                                component="div"
                                count={items.length}
                                page={page}
                                onPageChange={(_, newPage) => onPageChange(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => onRowsPerPageChange(Number.parseInt(event.target.value, 10))}
                                rowsPerPageOptions={[5, 10, 20]}
                            />
                        )}
                    </TableContainer>
                </CardContent>
            </Card>

            {children}

            <Dialog open={deleteDialogOpen} onClose={onCloseDeleteDialog}>
                <DialogTitle>{deleteDialogTitle}</DialogTitle>
                <DialogContent>{deleteDialogText}</DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDeleteDialog}>Cancelar</Button>
                    <Button color="error" onClick={onConfirmDelete}>
                        Inactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

CatalogoTableSection.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            header: PropTypes.string.isRequired,
            render: PropTypes.func.isRequired,
            align: PropTypes.oneOf(['left', 'center', 'right', 'justify', 'inherit']),
        })
    ).isRequired,
    items: PropTypes.array.isRequired,
    itemsPaginados: PropTypes.array.isRequired,
    idField: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    serverError: PropTypes.string,
    success: PropTypes.string,
    createLabel: PropTypes.string.isRequired,
    onCreate: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    deleteDialogOpen: PropTypes.bool.isRequired,
    deleteDialogTitle: PropTypes.string.isRequired,
    deleteDialogText: PropTypes.node.isRequired,
    onCloseDeleteDialog: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    children: PropTypes.node,
};

CatalogoTableSection.defaultProps = {
    serverError: '',
    success: '',
    children: null,
};
