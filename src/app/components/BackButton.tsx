'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const excludeRoutes = ['/', '/dashboard'];
  if (excludeRoutes.includes(pathname)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-4"
    >
      <Button
        onClick={() => router.back()}
        className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border border-primary text-primary bg-white shadow-sm"
        style={{
          fontWeight: 600,
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = 'rgba(13,110,253,0.1)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'white')
        }
      >
        <FaArrowLeft className="me-1" />
        {t('common.back')}
      </Button>
    </motion.div>
  );
}
