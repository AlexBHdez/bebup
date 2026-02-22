import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ArrowRight, Bell, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: (data: {
    weight: number;
    glassSize: number;
    dailyGoal: number;
    wakeTime: string;
    sleepTime: string;
  }) => void;
}

const GLASS_SIZES = [200, 250, 300, 350];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState(70);
  const [glassSize, setGlassSize] = useState(250);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");

  const dailyGoal = Math.round((weight * 35) / glassSize);
  const totalLiters = ((dailyGoal * glassSize) / 1000).toFixed(1);

  const navigate = useNavigate();

  const handleComplete = () => {
    onComplete({ weight, glassSize, dailyGoal, wakeTime, sleepTime });
    navigate("/");
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  };

  const steps = [
    // Welcome
    <motion.div
      key="welcome"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-6"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 water-gradient rounded-full flex items-center justify-center shadow-lg shadow-primary/20"
      >
        <Droplets size={48} className="text-primary-foreground" />
      </motion.div>
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">BebUp</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Tu compañero para mantenerte hidratado durante todo el día 💧
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Calcula tu meta diaria, recibe recordatorios y registra cada vaso de agua.
      </p>
    </motion.div>,

    // Weight
    <motion.div
      key="weight"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Cuánto pesas?</h2>
        <p className="text-muted-foreground text-sm">
          Usaremos tu peso para calcular cuánta agua necesitas
        </p>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-6xl font-extrabold text-foreground">{weight}</span>
        <span className="text-2xl text-muted-foreground font-semibold mb-2">kg</span>
      </div>
      <input
        type="range"
        min={40}
        max={150}
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="w-full h-2 bg-water-light rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:water-gradient [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-primary/30"
      />
    </motion.div>,

    // Glass size
    <motion.div
      key="glass"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tamaño de tu vaso</h2>
        <p className="text-muted-foreground text-sm">
          ¿Qué tamaño de vaso usas normalmente?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {GLASS_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setGlassSize(size)}
            className={`py-4 px-3 rounded-2xl border-2 font-bold text-lg transition-all ${
              glassSize === size
                ? "border-primary bg-water-light text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {size} ml
          </button>
        ))}
      </div>
    </motion.div>,

    // Goal result
    <motion.div
      key="goal"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-32 h-32 water-gradient rounded-full flex items-center justify-center shadow-xl shadow-primary/20"
      >
        <span className="text-4xl font-extrabold text-primary-foreground">{dailyGoal}</span>
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu objetivo diario</h2>
        <p className="text-primary font-bold text-lg">
          {dailyGoal} vasos ({totalLiters} litros) al día
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Basado en tu peso de {weight} kg y vasos de {glassSize} ml
        </p>
      </div>
    </motion.div>,

    // Schedule
    <motion.div
      key="schedule"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu horario</h2>
        <p className="text-muted-foreground text-sm">
          Te recordaremos beber agua en las horas que estés despierto
        </p>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border">
          <span className="font-semibold text-foreground">Me despierto</span>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="bg-water-light text-primary font-bold rounded-xl px-3 py-2 text-center border-0 outline-none"
          />
        </div>
        <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border">
          <span className="font-semibold text-foreground">Me acuesto</span>
          <input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            className="bg-water-light text-primary font-bold rounded-xl px-3 py-2 text-center border-0 outline-none"
          />
        </div>
      </div>
    </motion.div>,
  ];

  return (
    <div className="flex flex-col min-h-dvh water-gradient-soft">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-8 water-gradient" : i < step ? "w-2 bg-primary/40" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      {/* Bottom button */}
      <div className="px-8 pb-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else handleComplete();
          }}
          className="w-full water-gradient text-primary-foreground font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {step === steps.length - 1 ? (
            <>
              <Check size={20} /> ¡Empezar!
            </>
          ) : (
            <>
              Continuar <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
