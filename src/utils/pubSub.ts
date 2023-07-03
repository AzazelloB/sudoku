type Subscription = Record<string, CallableFunction[]>

const subsctibers: Subscription = {};

export const publish = (eventName: string, ...args: any[]) => {
  if (subsctibers.hasOwnProperty(eventName) === false) {
    return;
  }

  for (const callback of subsctibers[eventName]) {
    callback(...args);
  }
};

export const subscribe = (eventName: string, callback: CallableFunction) => {
  if (subsctibers[eventName]) {
    subsctibers[eventName].push(callback);
  } else {
    subsctibers[eventName] = [callback];
  }
};

export const unsubscribe = (eventName: string, callback: CallableFunction) => {
  if (!subsctibers[eventName]) {
    return;
  }

  subsctibers[eventName] = subsctibers[eventName].filter((cb) => cb !== callback);
};
