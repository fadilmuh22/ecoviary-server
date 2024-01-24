export const dateToCron = (date: Date): string => {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

export const hourListToCron = (hourList: string[]): string => {
  const hours = hourList.map((hour) => `${hour.substring(0, 2)} *`).join(",");
  return `0 ${hours} * * *`;
};

export const dayListToCron = (dayList: boolean[]): string => {
  const days = dayList
    .map((day, index) => (day ? index + 1 : 0))
    .filter((val) => val === 0)
    .join(",");
  return `0 12 * * ${days}`;
};
