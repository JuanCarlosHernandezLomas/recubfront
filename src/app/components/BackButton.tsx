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
      className="mb-3"
    >
      <Button
        onClick={() => router.back()}
        variant="outline-primary"
        className="d-inline-flex align-items-center gap-2 px-4 py-2 -pill shadow-sm fw-semibold"
        style={{
          fontSize: '0.95rem',
        }}
      >
        <FaArrowLeft />
        {t('common.back')}
      </Button>
    </motion.div>
  );
}
