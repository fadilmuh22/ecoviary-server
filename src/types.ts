import { ScheduledTask } from "node-cron";

export enum CollectionKeys {
  COOPS = "coops",
  USERS = "users",
  SENSORS = "sensors",
  CONTROLS = "controls",
  AUTOMATIONS = "automations",
  ACTIVE_AUTOMATIONS = "activeAutomations",
}

export enum AutomationStatus {
  default,
  scheduled,
  started,
}

export type Automations = {
  food: string[];
  water: string[];
  disinfectant: boolean[];
  date: number;
  status: AutomationStatus;
  activated: boolean;
};

export type AutomationJobs = {
  start?: ScheduledTask;
  food?: ScheduledTask[];
  water?: ScheduledTask[];
  disinfectant?: ScheduledTask;
  date?: number;
};
