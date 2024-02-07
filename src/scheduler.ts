import { schedule } from "node-cron";
import { automationsRef, controlsRef } from "./database";
import { onValue, update } from "firebase/database";
import { dateToCron, hourListToCron, dayListToCron } from "./utils";
import { AutomationJobs, Automations, AutomationStatus } from "./types";

let jobs: AutomationJobs = {};

const createControlsSchedule = (automation: Automations) => {
  const food = schedule(hourListToCron(automation.food), () => {
    update(controlsRef(), {
      food: true,
    });

    setTimeout(() => {
      update(controlsRef(), {
        food: false,
      });
    }, 30 * 1000);
  });
  const water = schedule(hourListToCron(automation.water), () => {
    update(controlsRef(), {
      water: true,
    });

    setTimeout(() => {
      update(controlsRef(), {
        water: false,
      });
    }, 30 * 1000);
  });
  const disinfectant = schedule(dayListToCron(automation.disinfectant), () => {
    update(controlsRef(), {
      disinfectant: true,
    });

    setTimeout(() => {
      update(controlsRef(), {
        disinfectant: false,
      });
    }, 30 * 1000);
  });
  jobs = {
    ...jobs,
    food,
    water,
    disinfectant,
  };
};

const createAutomationSchedule = (automation: Automations) => {
  const automationCron = dateToCron(new Date(automation.date));

  let startJob;

  try {
    startJob = schedule(automationCron, () => {
      createControlsSchedule(automation);

      update(automationsRef(), {
        status: AutomationStatus.started,
      });

      console.log(`[${new Date()}][jobs]: started on ${new Date()}`, jobs);
    });
  } catch (error) {
    console.log(`[${new Date()}][jobs]: errored`, error, jobs);
  }

  jobs = { ...jobs, start: startJob };

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
    const automation: Automations = snapshot.val();
    console.log(`[${new Date()}][jobs]: automation`, automation);

    if (jobs.date && jobs.date !== automation.date) {
      jobs.start?.stop();
      jobs.food?.stop();
      jobs.water?.stop();
      jobs.disinfectant?.stop();
      jobs = {};
    }

    if (automation.activated === false) return;

    switch (automation.status) {
      case AutomationStatus.default:
        createAutomationSchedule(automation);
        break;
      case AutomationStatus.scheduled:
        if (!jobs || !jobs.start) {
          createAutomationSchedule(automation);
        }
        break;
      case AutomationStatus.started:
        if (!jobs) {
          createControlsSchedule(automation);
        }
        break;
      default:
        break;
    }
  });

  return automationValues;
};
