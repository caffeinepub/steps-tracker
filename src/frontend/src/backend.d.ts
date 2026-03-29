import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DayLog {
    date: string;
    steps: bigint;
}
export interface backendInterface {
    addSteps(date: string, steps: bigint): Promise<bigint>;
    getLast7Days(startDate: bigint): Promise<Array<DayLog>>;
    getTodaySteps(date: string): Promise<bigint>;
    logSteps(date: string, steps: bigint): Promise<void>;
}
