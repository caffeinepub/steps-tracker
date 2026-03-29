import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DayLog } from "../backend";
import { useActor } from "./useActor";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function useTodaySteps() {
  const { actor, isFetching } = useActor();
  const today = getTodayString();
  return useQuery<bigint>({
    queryKey: ["todaySteps", today],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTodaySteps(today);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLast7Days() {
  const { actor, isFetching } = useActor();
  return useQuery<DayLog[]>({
    queryKey: ["last7Days"],
    queryFn: async () => {
      if (!actor) return [];
      const today = new Date();
      const sevenDaysAgo = BigInt(
        Math.floor(
          new Date(today.setDate(today.getDate() - 6)).getTime() / 1000,
        ),
      );
      return actor.getLast7Days(sevenDaysAgo);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSteps() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const today = getTodayString();

  return useMutation({
    mutationFn: async (steps: number) => {
      if (!actor) throw new Error("No actor");
      return actor.addSteps(today, BigInt(steps));
    },
    onMutate: async (steps: number) => {
      await queryClient.cancelQueries({ queryKey: ["todaySteps", today] });
      const prev =
        queryClient.getQueryData<bigint>(["todaySteps", today]) ?? BigInt(0);
      queryClient.setQueryData(["todaySteps", today], prev + BigInt(steps));
      return { prev };
    },
    onError: (
      _err: unknown,
      _steps: number,
      ctx: { prev: bigint } | undefined,
    ) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(["todaySteps", today], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySteps", today] });
      queryClient.invalidateQueries({ queryKey: ["last7Days"] });
    },
  });
}

export function useResetToday() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const today = getTodayString();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.logSteps(today, BigInt(0));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["todaySteps", today] });
      const prev = queryClient.getQueryData<bigint>(["todaySteps", today]);
      queryClient.setQueryData(["todaySteps", today], BigInt(0));
      return { prev };
    },
    onError: (
      _err: unknown,
      _v: undefined,
      ctx: { prev: bigint | undefined } | undefined,
    ) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(["todaySteps", today], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySteps", today] });
      queryClient.invalidateQueries({ queryKey: ["last7Days"] });
    },
  });
}
