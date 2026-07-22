import PropTypes from 'prop-types';
import { Skeleton, TableCell, TableRow } from '@mui/material';

const SKELETON_WIDTHS = ['58%', '76%', '66%', '84%', '52%', '72%'];

export default function TableSkeletonRows({ columns, rows = 6 }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <TableRow key={`table-skeleton-${rowIndex}`} aria-hidden="true">
      {Array.from({ length: columns }, (_, columnIndex) => (
        <TableCell key={`table-skeleton-${rowIndex}-${columnIndex}`} sx={{ py: 1.75 }}>
          <Skeleton
            animation="wave"
            variant="rounded"
            width={SKELETON_WIDTHS[(rowIndex + columnIndex) % SKELETON_WIDTHS.length]}
            height={18}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

TableSkeletonRows.propTypes = {
  columns: PropTypes.number.isRequired,
  rows: PropTypes.number,
};
