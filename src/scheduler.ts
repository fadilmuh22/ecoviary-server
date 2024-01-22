import { schedule } from "node-cron";
import { automationsRef, controlsRef } from "./database";
import { onValue, update } from "firebase/database";
import { dateToCron, hourListToCron, dayListToCron } from "./utils";
import { AutomationJobs, Automations, AutomationStatus } from "./types";

const jobs: AutomationJobs = {};

const createControlsSchedule = (key: string, automation: Automations) => {
  const food = schedule(hourListToCron(automation.food), () => {
    update(controlsRef(), {
      food: true,
    });
  });
  const water = schedule(hourListToCron(automation.water), () => {
    update(controlsRef(), {
      water: true,
    });
  });
  const disinfectant = schedule(dayListToCron(automation.disinfectant), () => {
    update(controlsRef(), {
      disinfectant: true,
    });
  });
  jobs[key] = {
    ...jobs[key],
    food,
    water,
    disinfectant,
  };
};

const createAutomationSchedule = (key: string, automation: Automations) => {
  const automationCron = dateToCron(new Date(automation.date));

  jobs[key] = jobs[key] || {};

  let startJob;

  try {
    startJob = schedule(automationCron, () => {
      createControlsSchedule(key, automation);

      update(automationsRef(), {
        status: AutomationStatus.started,
      });

      console.log(`[${new Date()}][jobs]: started on ${new Date()}`, jobs);
    });
  } catch (error) {
    console.log(`[${new Date()}][jobs]: errored`, error, jobs[key]);
  }

  jobs[key] = { ...jobs[key], start: startJob };

  update(automationsRef(), {
    status: AutomationStatus.scheduled,
  });

  console.log(
    `[${new Date()}][jobs]: scheduled for ${new Date(
      automation.date
    )} cron(${automationCron}) `,
    jobs
  );
};

export const watchAutomations = () => {
  const automationValues = onValue(automationsRef(), (snapshot) => {
    const automationList: Record<string, Automations> = snapshot.val();
    const automationKeys = Object.keys(automationList);

    // clear jobs that are not in the database
    Object.keys(jobs).forEach((key) => {
      if (!automationKeys.includes(key) && jobs[key]) {
        jobs[key].start?.stop();
        jobs[key].food?.stop();
        jobs[key].water?.stop();
        jobs[key].disinfectant?.stop();
        delete jobs[key];
      }
    });

    automationKeys.forEach((key) => {
      const automation = automationList[key];

      if (automation.activated === false) return;

      switch (automation.status) {
        case AutomationStatus.default:
          createAutomationSchedule(key, automation);
          break;
        case AutomationStatus.scheduled:
          if (!jobs[key] || !jobs[key].start) {
            createAutomationSchedule(key, automation);
          }
          break;
        case AutomationStatus.started:
          if (!jobs[key]) {
            createControlsSchedule(key, automation);
          }
          break;
        default:
          break;
      }
    });
  });

  return automationValues;
};
