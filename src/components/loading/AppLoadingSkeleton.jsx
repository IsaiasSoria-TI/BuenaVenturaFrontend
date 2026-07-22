import { Box, Skeleton } from '@mui/material';

export default function AppLoadingSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Cargando contenido"
      sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4f9' }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 256,
          flexShrink: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#0f172a',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.16)' }} />
          <Skeleton width={128} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.16)' }} />
        </Box>

        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            key={`navigation-skeleton-${index}`}
            animation="wave"
            variant="rounded"
            width={index % 3 === 0 ? '72%' : '90%'}
            height={38}
            sx={{ bgcolor: 'rgba(255,255,255,0.10)' }}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }} aria-hidden="true">
        <Box
          sx={{
            height: 72,
            px: { xs: 2, md: 3.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#fff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Skeleton width={180} height={28} />
          <Skeleton variant="circular" width={34} height={34} />
        </Box>

        <Box sx={{ p: { xs: 2, md: 3.5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, md: 2.5 },
              mb: 3,
            }}
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Box key={`card-skeleton-${index}`} sx={{ bgcolor: '#fff', borderRadius: 3, p: 2.5 }}>
                <Skeleton width="58%" height={20} />
                <Skeleton width="76%" height={38} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>

          <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2.5 }}>
            <Skeleton width={220} height={26} sx={{ mb: 2 }} />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={`content-skeleton-${index}`}
                animation="wave"
                variant="rounded"
                height={36}
                sx={{ mb: 1.25 }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
