import { motion, AnimatePresence } from "framer-motion";
import { Undo2, Droplets } from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import WaterButton from "@/components/WaterButton";
import BottomNav from "@/components/BottomNav";
import { useHydration } from "@/hooks/useHydration";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getProgressMessage } from "@/lib/hydration/messages";

const Dashboard = () => {
  const { settings, todayLog, addGlass, undoGlass } = useHydration();
  const navigate = useNavigate();

  useEffect(() => {
    if (!settings.onboarded) {
      navigate("/onboarding");
    }
  }, [settings.onboarded, navigate]);

  const message = getProgressMessage(todayLog.glasses, settings.dailyGoal);
  const remaining = Math.max(0, settings.dailyGoal - todayLog.glasses);
  const totalMl = todayLog.glasses * settings.glassSize;

  return (
    <div className="flex flex-col min-h-dvh water-gradient-soft pb-20">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <Droplets size={24} className="text-primary" />
          <h1 className="text-xl font-extrabold text-foreground">BebUp</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {/* Motivational message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={message.text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center"
          >
            <span className="text-3xl mb-1 block">{message.emoji}</span>
            <p className="text-muted-foreground font-semibold text-sm">{message.text}</p>
          </motion.div>
        </AnimatePresence>

        {/* Circular progress */}
        <CircularProgress current={todayLog.glasses} goal={settings.dailyGoal} size={220} />

        {/* Stats row */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-extrabold text-foreground">{totalMl}</p>
            <p className="text-xs text-muted-foreground font-medium">ml bebidos</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-2xl font-extrabold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground font-medium">vasos restantes</p>
          </div>
        </div>

        {/* Add button */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <WaterButton onClick={addGlass} />
          <span className="text-primary font-bold text-sm">+1 vaso ({settings.glassSize} ml)</span>
        </div>

        {/* Undo */}
        {todayLog.glasses > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={undoGlass}
            className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium py-2 px-4 rounded-full bg-card border border-border"
          >
            <Undo2 size={14} />
            Deshacer último vaso
          </motion.button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
