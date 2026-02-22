import { motion } from "framer-motion";
import { Droplets, Flame, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useHydration } from "@/hooks/useHydration";
import { formatHistoryDate, getCompletedDays, getRecentLogs } from "@/lib/hydration/history";

const History = () => {
  const { logs, getStreak } = useHydration();
  const streak = getStreak();

  const sortedLogs = getRecentLogs(logs);

  const completedDays = getCompletedDays(logs);

  return (
    <div className="flex flex-col min-h-dvh water-gradient-soft pb-20">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Historial</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu progreso de hidratación</p>
      </div>

      {/* Stats cards */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame size={16} className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground font-medium">Racha actual</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-water-light flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{completedDays}</p>
          <p className="text-xs text-muted-foreground font-medium">Días completados</p>
        </motion.div>
      </div>

      {/* History list */}
      <div className="px-6 flex-1">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Registro diario
        </h2>
        {sortedLogs.length === 0 ? (
          <div className="text-center py-12">
            <Droplets size={40} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aún no hay registros</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Empieza a beber agua para ver tu historial
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedLogs.map((log, i) => {
              const completed = log.glasses >= log.goal;
              const pct = Math.min((log.glasses / log.goal) * 100, 100);
              return (
                <motion.div
                  key={log.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid="history-row"
                  className="surface-card p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      completed
                        ? "bg-success/10 text-success"
                        : "bg-water-light text-primary"
                    }`}
                  >
                    {completed ? "✓" : `${Math.round(pct)}%`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{formatHistoryDate(log.date)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className={`h-full rounded-full ${completed ? "bg-success" : "water-gradient"}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {log.glasses}/{log.goal}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
