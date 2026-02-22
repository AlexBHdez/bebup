import { motion } from "framer-motion";
import { User, GlassWater, Bell, Moon, Sun, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useHydration } from "@/hooks/useHydration";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentPushSubscription,
  getNotificationPermission,
  getPushSupport,
  requestPushPermission,
  subscribeToPush,
  syncPushSubscription,
  unsubscribeFromPush,
} from "@/lib/push/client";

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
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [pushError, setPushError] = useState<string | null>(null);

  const pushSupported = useMemo(() => getPushSupport().supported, []);

  const handleReset = () => {
    if (confirm("¿Estás seguro? Se borrará toda tu configuración.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadPushState = async () => {
      if (!pushSupported) {
        setPushPermission("unsupported");
        return;
      }

      setPushPermission(getNotificationPermission());

      try {
        const subscription = await getCurrentPushSubscription();
        if (mounted) {
          setPushEnabled(Boolean(subscription));
        }
      } catch {
        if (mounted) {
          setPushEnabled(false);
        }
      }
    };

    void loadPushState();

    return () => {
      mounted = false;
    };
  }, [pushSupported]);

  useEffect(() => {
    if (!pushEnabled) {
      return;
    }

    void syncPushSubscription(settings).catch(() => undefined);
  }, [
    pushEnabled,
    settings.remindersEnabled,
    settings.reminderInterval,
    settings.wakeTime,
    settings.sleepTime,
  ]);

  const handleEnablePush = async () => {
    setPushBusy(true);
    setPushError(null);

    try {
      let permission = getNotificationPermission();
      if (permission === "default") {
        permission = await requestPushPermission();
      }

      setPushPermission(permission);

      if (permission !== "granted") {
        setPushError("No se concedió permiso para notificaciones.");
        return;
      }

      await subscribeToPush(settings);
      setPushEnabled(true);
      updateSettings({ remindersEnabled: true });
    } catch (error) {
      setPushError(error instanceof Error ? error.message : "No se pudo activar push.");
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    setPushError(null);

    try {
      await unsubscribeFromPush();
      setPushEnabled(false);
    } catch (error) {
      setPushError(error instanceof Error ? error.message : "No se pudo desactivar push.");
    } finally {
      setPushBusy(false);
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
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-chip">
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
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-chip">
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
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all min-h-10 ${
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
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-chip">
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
        <div className="surface-card p-5">
          <p className="font-bold text-foreground text-sm mb-3">Frecuencia de recordatorios</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Recordatorios</span>
            <button
              onClick={() => updateSettings({ remindersEnabled: !settings.remindersEnabled })}
              className={`select-pill px-3 py-1.5 min-h-9 ${
                settings.remindersEnabled
                  ? "water-gradient text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {settings.remindersEnabled ? "Activados" : "Desactivados"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((interval) => (
              <button
                key={interval.value}
                onClick={() => updateSettings({ reminderInterval: interval.value })}
                className={`select-pill py-2 px-4 ${
                  settings.reminderInterval === interval.value
                    ? "water-gradient text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {interval.label}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-bold text-foreground text-sm mb-2">Notificaciones push</p>
            {!pushSupported ? (
              <p className="text-xs text-muted-foreground">Tu navegador no soporta push.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Estado: {pushEnabled ? "Activo" : "Inactivo"} · Permiso: {pushPermission}
                </p>
                <div className="flex gap-2">
                  {!pushEnabled ? (
                    <button
                      onClick={handleEnablePush}
                      disabled={pushBusy}
                      className="select-pill px-4 py-2 water-gradient text-primary-foreground disabled:opacity-60"
                    >
                      {pushBusy ? "Activando..." : "Activar push"}
                    </button>
                  ) : (
                    <button
                      onClick={handleDisablePush}
                      disabled={pushBusy}
                      className="select-pill px-4 py-2 bg-muted text-foreground disabled:opacity-60"
                    >
                      {pushBusy ? "Desactivando..." : "Desactivar push"}
                    </button>
                  )}
                </div>
                {pushError && (
                  <p className="text-xs text-destructive">{pushError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full min-h-11 flex items-center justify-center gap-2 text-destructive font-semibold text-sm py-4 rounded-2xl bg-card border border-border"
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
