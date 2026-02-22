import { motion } from "framer-motion";

interface CircularProgressProps {
  current: number;
  goal: number;
  size?: number;
}

const CircularProgress = ({ current, goal, size = 240 }: CircularProgressProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const completed = current >= goal;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--water-light))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--primary))"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="flex flex-col items-center z-10">
        <motion.span
          key={current}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-extrabold text-foreground"
        >
          {current}
        </motion.span>
        <span className="text-muted-foreground text-sm font-medium">
          de {goal} vasos
        </span>
        {completed && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-success text-xs font-bold mt-1"
          >
            ¡Meta cumplida! 🎉
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
