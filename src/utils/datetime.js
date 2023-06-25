export const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - (hours * 3600)) / 60);
  const seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

  const hoursStr = hours > 0 ? `${hours}:` : '';
  const minutesStr = minutes < 10 ? `0${minutes}:` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;

  return `${hoursStr}${minutesStr}${secondsStr}`;
};
