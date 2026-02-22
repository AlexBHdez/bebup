import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface WaterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const WaterButton = ({ onClick, disabled }: WaterButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      onClick={onClick}
      disabled={disabled}
      className="water-gradient text-primary-foreground rounded-full w-[72px] h-[72px] flex items-center justify-center shadow-lg shadow-primary/25 active:shadow-md transition-shadow disabled:opacity-50"
    >
      <Plus size={32} strokeWidth={2.5} />
    </motion.button>
  );
};

export default WaterButton;
