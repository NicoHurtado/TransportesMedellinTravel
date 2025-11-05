'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ConfirmationProps {
  trackingId: string;
  onClose: () => void;
}

export default function Confirmation({ trackingId, onClose }: ConfirmationProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const trackingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/track/${trackingId}`
    : `/track/${trackingId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <CheckCircle className="w-24 h-24 text-black mb-6" strokeWidth={1.5} />
      </motion.div>

      {/* Success message */}
      <h3 className="text-3xl font-semibold mb-3 text-center">
        ¡Tu solicitud fue registrada!
      </h3>
      <p className="text-gray-600 mb-8 text-center max-w-md text-lg">
        {t('confirmationMessage')}
      </p>

      {/* Tracking link */}
      <div className="w-full max-w-lg space-y-4">
        <p className="text-sm font-medium text-center">{t('trackingLink')}</p>
        
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
          <input
            type="text"
            value={trackingUrl}
            readOnly
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Copy link"
          >
            <Copy className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
          </button>
        </div>

        {copied && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-green-600 text-center"
          >
            ✓ Link copied!
          </motion.p>
        )}

        <button
          onClick={() => window.open(trackingUrl, '_blank')}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black text-black rounded-xl font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <ExternalLink className="w-5 h-5" />
          {t('viewStatus')}
        </button>
      </div>

      {/* Back to home */}
      <button
        onClick={onClose}
        className="mt-8 px-6 py-3 text-black hover:bg-gray-100 rounded-xl font-medium transition-colors min-h-[44px]"
      >
        {t('backHome')}
      </button>
    </motion.div>
  );
}

