import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Check, Pencil, RotateCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddSteps,
  useLast7Days,
  useResetToday,
  useTodaySteps,
} from "./hooks/useQueries";

const DEFAULT_GOAL = 10000;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function getCalories(steps: number): number {
  return Math.round(steps * 0.04);
}

function getActiveMinutes(steps: number): number {
  return Math.round(steps / 100);
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function App() {
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));
  const [customSteps, setCustomSteps] = useState("");
  const goalInputRef = useRef<HTMLInputElement>(null);

  const { data: todayStepsRaw, isLoading } = useTodaySteps();
  const { data: last7Days } = useLast7Days();
  const addStepsMutation = useAddSteps();
  const resetMutation = useResetToday();

  const todaySteps = Number(todayStepsRaw ?? 0);
  const pct = Math.min(100, Math.round((todaySteps / goal) * 100));
  const remaining = Math.max(0, goal - todaySteps);

  const handleQuickAdd = (amount: number) => {
    addStepsMutation.mutate(amount, {
      onSuccess: () => toast.success(`+${formatNumber(amount)} steps added`),
      onError: () => toast.error("Failed to add steps"),
    });
  };

  const handleCustomAdd = () => {
    const val = Number.parseInt(customSteps, 10);
    if (!val || val <= 0) return;
    addStepsMutation.mutate(val, {
      onSuccess: () => {
        toast.success(`+${formatNumber(val)} steps added`);
        setCustomSteps("");
      },
      onError: () => toast.error("Failed to add steps"),
    });
  };

  const handleReset = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => toast.success("Today's steps reset"),
      onError: () => toast.error("Failed to reset"),
    });
  };

  const startEditGoal = () => {
    setGoalInput(String(goal));
    setEditingGoal(true);
    setTimeout(() => goalInputRef.current?.focus(), 50);
  };

  const confirmGoal = () => {
    const val = Number.parseInt(goalInput, 10);
    if (val && val > 0) setGoal(val);
    setEditingGoal(false);
  };

  const cancelGoal = () => {
    setEditingGoal(false);
    setGoalInput(String(goal));
  };

  const chartData = (() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    const maxSteps = Math.max(
      1,
      ...(last7Days ?? []).map((d) => Number(d.steps)),
    );
    return days.map((date, i) => {
      const log = (last7Days ?? []).find((d) => d.date === date);
      const steps = log ? Number(log.steps) : 0;
      const heightPct = Math.round((steps / maxSteps) * 100);
      return { date, steps, heightPct, label: DAY_LABELS[i] };
    });
  })();

  const recentActivity = [...(last7Days ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-xl font-bold tracking-widest text-foreground uppercase">
            STRIDE
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-4"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Every step is a new beginning.
          </h1>
        </motion.div>

        {/* Primary Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="bg-card rounded-xl shadow-card p-6 space-y-5"
          data-ocid="stats.card"
        >
          {/* Step Count */}
          <div className="text-center">
            {isLoading ? (
              <div
                className="text-6xl font-bold text-foreground tabular-nums"
                data-ocid="stats.loading_state"
              >
                —
              </div>
            ) : (
              <div
                className="text-6xl font-bold text-foreground tabular-nums leading-none"
                data-ocid="steps.panel"
              >
                {formatNumber(todaySteps)}
              </div>
            )}
            <p className="text-xs font-semibold tracking-widest text-muted-foreground mt-1 uppercase">
              Steps Today
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1" data-ocid="progress.panel">
            <div className="w-full h-3 bg-green-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="text-right text-xs text-muted-foreground font-medium">
              {pct}%
            </div>
          </div>

          {/* Info Row */}
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {formatNumber(todaySteps)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Current
              </div>
            </div>
            <div className="text-center">
              {editingGoal ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={goalInputRef}
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-24 h-7 text-sm text-center"
                    type="number"
                    min="1"
                    data-ocid="goal.input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmGoal();
                      if (e.key === "Escape") cancelGoal();
                    }}
                  />
                  <button
                    type="button"
                    onClick={confirmGoal}
                    className="text-green hover:opacity-70"
                    data-ocid="goal.save_button"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelGoal}
                    className="text-muted-foreground hover:opacity-70"
                    data-ocid="goal.cancel_button"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEditGoal}
                  className="group flex flex-col items-center"
                  data-ocid="goal.edit_button"
                >
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    {formatNumber(goal)}
                    <Pencil
                      size={11}
                      className="opacity-0 group-hover:opacity-50 transition-opacity"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Goal
                  </div>
                </button>
              )}
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {formatNumber(remaining)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Remaining
              </div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex gap-2 flex-wrap" data-ocid="quickadd.panel">
            {[500, 1000, 2000].map((amt, idx) => (
              <button
                type="button"
                key={amt}
                onClick={() => handleQuickAdd(amt)}
                disabled={addStepsMutation.isPending}
                className="flex-1 min-w-[72px] py-2 px-3 rounded-full border border-green text-green text-sm font-medium hover:bg-green hover:text-white transition-colors disabled:opacity-50"
                data-ocid={`quickadd.button.${idx + 1}`}
              >
                +{formatNumber(amt)}
              </button>
            ))}
          </div>

          {/* Custom Add */}
          <div className="flex gap-2" data-ocid="custom.panel">
            <Input
              type="number"
              min="1"
              placeholder="Custom steps…"
              value={customSteps}
              onChange={(e) => setCustomSteps(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomAdd();
              }}
              className="flex-1"
              data-ocid="custom.input"
            />
            <Button
              onClick={handleCustomAdd}
              disabled={!customSteps || addStepsMutation.isPending}
              className="bg-green text-white hover:opacity-90 border-0"
              data-ocid="custom.submit_button"
            >
              Add
            </Button>
          </div>

          {/* KPI blocks + Reset */}
          <div className="flex gap-4">
            <div className="flex-1 bg-background rounded-lg px-4 py-3 text-center">
              <div className="text-xl font-bold text-foreground">
                {getActiveMinutes(todaySteps)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                Active Minutes
              </div>
            </div>
            <div className="flex-1 bg-background rounded-lg px-4 py-3 text-center">
              <div className="text-xl font-bold text-foreground">
                {getCalories(todaySteps)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                Calories Est.
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={resetMutation.isPending}
                className="text-muted-foreground hover:text-destructive gap-1.5"
                data-ocid="reset.button"
              >
                <RotateCcw size={14} />
                Reset
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Activity History Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="bg-card rounded-xl shadow-card p-6"
          data-ocid="history.card"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            7-Day Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div data-ocid="chart.panel">
              <div className="flex items-end gap-1" style={{ height: "112px" }}>
                {chartData.map((day, i) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1 h-full"
                  >
                    <div className="w-full flex items-end flex-1">
                      <motion.div
                        className="w-full rounded-t-sm bg-green"
                        style={{ minHeight: day.steps > 0 ? 4 : 2 }}
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max(day.heightPct, day.steps > 0 ? 4 : 2)}%`,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 0.05 * i,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity List */}
            <div data-ocid="activity.list">
              {recentActivity.length === 0 ? (
                <div
                  className="text-sm text-muted-foreground text-center py-6"
                  data-ocid="activity.empty_state"
                >
                  No activity recorded yet.
                </div>
              ) : (
                <ul className="space-y-1">
                  {recentActivity.map((log, i) => (
                    <li
                      key={log.date}
                      className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
                      data-ocid={`activity.item.${i + 1}`}
                    >
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatNumber(Number(log.steps))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daily Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="bg-card rounded-xl shadow-card p-6"
          data-ocid="daily.card"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Daily Steps
          </h2>
          {(last7Days ?? []).length === 0 ? (
            <div
              className="text-sm text-muted-foreground"
              data-ocid="daily.empty_state"
            >
              No data yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-0">
              {[...(last7Days ?? [])]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log, i) => (
                  <div
                    key={log.date}
                    className="flex justify-between py-1.5 border-b border-border"
                    data-ocid={`daily.item.${i + 1}`}
                  >
                    <span className="text-sm text-muted-foreground">
                      {formatDate(log.date)}
                    </span>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {formatNumber(Number(log.steps))}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
