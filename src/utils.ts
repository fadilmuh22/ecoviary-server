export const dateToCron = (date: Date): string => {
  const minutes = new Date().getMinutes() + 1;
  const hours = new Date().getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

export const hourListToCron = (hour: string): string => {
  return `${hour.substring(3)} ${hour.substring(0, 2)} * * *`;
};

export const dayListToCron = (dayList: boolean[]): string => {
  const days = dayList
    .map((day, index) => (day ? index + 1 : 0))
    .filter((val) => val === 0)
    .join(",");
  return `0 12 * * ${days}`;
};

export const tenSeconds = 10 * 1000;
