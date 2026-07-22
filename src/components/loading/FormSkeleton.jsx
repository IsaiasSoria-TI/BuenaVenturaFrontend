import PropTypes from 'prop-types';
import { Box, Skeleton } from '@mui/material';

export default function FormSkeleton({ fields = 6, columns = 2 }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` },
        gap: 2,
      }}
    >
      {Array.from({ length: fields }, (_, index) => (
        <Box key={`form-skeleton-${index}`}>
          <Skeleton animation="wave" width="38%" height={18} sx={{ mb: 0.75 }} />
          <Skeleton animation="wave" variant="rounded" width="100%" height={56} />
        </Box>
      ))}
    </Box>
  );
}

FormSkeleton.propTypes = {
  columns: PropTypes.number,
  fields: PropTypes.number,
};
