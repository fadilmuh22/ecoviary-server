import { schedule } from "node-cron";
import { automationsRef, controlsRef } from "./database";
import { onValue, update } from "firebase/database";
import { dateToCron, hourListToCron, dayListToCron, tenSeconds } from "./utils";
import { AutomationJobs, Automations, AutomationStatus } from "./types";

let jobs: AutomationJobs = {};

const createControlsSchedule = (automation: Automations) => {
  const food = automation.food.map((foodHour) =>
    schedule(hourListToCron(foodHour), () => {
      update(controlsRef(), {
        food: true,
      });

      console.log(
        `[${new Date()}][jobs]: food started cron(${hourListToCron(foodHour)})`,
        jobs
      );

      setTimeout(() => {
        update(controlsRef(), {
          food: false,
        });
        console.log(`[${new Date()}][jobs]: food finished`, jobs);
      }, tenSeconds);
    })
  );
  const water = automation.water.map((waterHour) =>
    schedule(hourListToCron(waterHour), () => {
      update(controlsRef(), {
        water: true,
      });

      console.log(
        `[${new Date()}][jobs]: water started cron(${hourListToCron(
          waterHour
        )})`,
        jobs
      );

      setTimeout(() => {
        update(controlsRef(), {
          water: false,
        });
        console.log(`[${new Date()}][jobs]: water finished`, jobs);
      }, tenSeconds);
    })
  );
  const disinfectant = schedule(dayListToCron(automation.disinfectant), () => {
    update(controlsRef(), {
      disinfectant: true,
    });

    console.log(
      `[${new Date()}][jobs]: disinfectant started cron(${dayListToCron(
        automation.disinfectant
      )})`,
      jobs
    );

    setTimeout(() => {
      update(controlsRef(), {
        disinfectant: false,
      });
      console.log(`[${new Date()}][jobs]: disinfectant finished`, jobs);
    }, tenSeconds);
  });
  jobs = {
    ...jobs,
    food,
    water,
    disinfectant,
  };
};

const createAutomationSchedule = (automation: Automations) => {
  const automationDate = new Date(0);
  automationDate.setMilliseconds(automation.date);
  automationDate.setMinutes(new Date().getMinutes() + 1);
  automationDate.setHours(new Date().getHours());

  const automationCron = dateToCron(automationDate);

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
    `[${new Date()}][jobs]: scheduled for ${automationDate} cron(${automationCron}) `,
    jobs
  );
};

export const watchAutomations = () => {
  const automationValues = onValue(automationsRef(), (snapshot) => {
    const automation: Automations = snapshot.val();
    console.log(`[${new Date()}][jobs]: automation`, automation);

    if (jobs.date && jobs.date !== automation.date) {
      jobs.start?.stop();
      jobs.food?.forEach((foodJob) => foodJob.stop());
      jobs.water?.forEach((waterJob) => waterJob.stop());
      jobs.disinfectant?.stop();
      jobs = {};
    }

    if (automation.activated === false) return;

    switch (automation.status) {
      case AutomationStatus.default:
      case AutomationStatus.scheduled:
        createAutomationSchedule(automation);
        break;
      case AutomationStatus.started:
        if (!jobs) {
          jobs = {};
          jobs.date = automation.date;
          createControlsSchedule(automation);
        }
        break;
      default:
        break;
    }
  });

  return automationValues;
};
