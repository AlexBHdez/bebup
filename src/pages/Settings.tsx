import { motion } from "framer-motion";
import { User, GlassWater, Bell, Moon, Sun, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useHydration } from "@/hooks/useHydration";

const GLASS_SIZES = [200, 250, 300, 350];
const INTERVALS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1.5 horas" },
  { value: 120, label: "2 horas" },
];

const Settings = () => {
  const { settings, updateSettings } = useHydration();
  const totalLiters = ((settings.dailyGoal * settings.glassSize) / 1000).toFixed(1);

  const handleReset = () => {
    if (confirm("¿Estás seguro? Se borrará toda tu configuración.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-dvh water-gradient-soft pb-20">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Ajustes</h1>
        <p className="text-muted-foreground text-sm mt-1">Personaliza tu experiencia</p>
      </div>

      <div className="px-6 space-y-4 flex-1">
        {/* Goal summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="water-gradient rounded-2xl p-5 text-primary-foreground"
        >
          <p className="text-sm font-medium opacity-90">Tu meta diaria</p>
          <p className="text-3xl font-extrabold mt-1">
            {settings.dailyGoal} vasos
          </p>
          <p className="text-sm font-medium opacity-80 mt-0.5">
            {totalLiters} litros · vasos de {settings.glassSize} ml
          </p>
        </motion.div>

        {/* Weight */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-water-light flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Peso</p>
              <p className="text-xs text-muted-foreground">Ajusta para recalcular tu meta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={40}
              max={150}
              value={settings.weight}
              onChange={(e) => updateSettings({ weight: Number(e.target.value) })}
              className="flex-1 h-2 bg-water-light rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:water-gradient [&::-webkit-slider-thumb]:shadow-md"
            />
            <span className="text-lg font-extrabold text-foreground w-16 text-right">
              {settings.weight} kg
            </span>
          </div>
        </div>

        {/* Glass size */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-water-light flex items-center justify-center">
              <GlassWater size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Tamaño del vaso</p>
            </div>
          </div>
          <div className="flex gap-2">
            {GLASS_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => updateSettings({ glassSize: size })}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  settings.glassSize === size
                    ? "water-gradient text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {size}ml
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-water-light flex items-center justify-center">
              <Bell size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Horario</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-amber-500" />
              <span className="text-sm font-medium text-foreground">Despertar</span>
            </div>
            <input
              type="time"
              value={settings.wakeTime}
              onChange={(e) => updateSettings({ wakeTime: e.target.value })}
              className="bg-water-light text-primary font-bold rounded-xl px-3 py-2 text-sm border-0 outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-indigo-400" />
              <span className="text-sm font-medium text-foreground">Dormir</span>
            </div>
            <input
              type="time"
              value={settings.sleepTime}
              onChange={(e) => updateSettings({ sleepTime: e.target.value })}
              className="bg-water-light text-primary font-bold rounded-xl px-3 py-2 text-sm border-0 outline-none"
            />
          </div>
        </div>

        {/* Reminder interval */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <p className="font-bold text-foreground text-sm mb-3">Frecuencia de recordatorios</p>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((interval) => (
              <button
                key={interval.value}
                onClick={() => updateSettings({ reminderInterval: interval.value })}
                className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                  settings.reminderInterval === interval.value
                    ? "water-gradient text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {interval.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 text-destructive font-semibold text-sm py-4 rounded-2xl bg-card border border-border"
        >
          <RotateCcw size={16} />
          Reiniciar configuración
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
