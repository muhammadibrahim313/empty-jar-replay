import { motion } from 'framer-motion';
import { MOMENT_TYPES, MomentType } from '@/lib/types';

interface MomentTypeSelectorProps {
  value: MomentType;
  onChange: (type: MomentType) => void;
}

export default function MomentTypeSelector({ value, onChange }: MomentTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-caption block">What kind of moment?</label>
      <div className="flex flex-wrap gap-2">
        {MOMENT_TYPES.map((type) => (
          <motion.button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`tag-chip ${value === type.value ? 'selected' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{type.emoji}</span>
            <span>{type.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
