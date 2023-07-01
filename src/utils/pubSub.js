export const subsctibers = {};

export const publish = (eventName, data) => {
  for (const callback of subsctibers[eventName]) {
    callback(data);
  }
};

export const subscribe = (eventName, callback) => {
  if (subsctibers[eventName]) {
    subsctibers[eventName].push(callback);
  } else {
    subsctibers[eventName] = [callback];
  }
};

export const unsubscribe = (eventName, callback) => {
  if (!subsctibers[eventName]) {
    return;
  }

  subsctibers[eventName] = subsctibers[eventName].filter((cb) => cb !== callback);
};
