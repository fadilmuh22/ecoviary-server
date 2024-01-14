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
  food: number[];
  water: number[];
  disinfectant: boolean[];
  date: number;
  status: AutomationStatus;
};

export type AutomationJobs = {
  [key: string]: {
    start?: ScheduledTask;
    food?: ScheduledTask;
    water?: ScheduledTask;
    disinfectant?: ScheduledTask;
    date?: number;
  };
};
