import DeepProxy, { DeepProxyHandler } from 'proxy-deep';
import { publish } from '~/utils/pubSub';

const handler: DeepProxyHandler<any> = {
  set(target, prop, value, reciver) {
    const result = Reflect.set(target, prop, value, reciver);
    
    if (this.path.includes('cells') || prop === 'cells') {
      // TODO on restart this is called +1 time every restart
      // find the memory leak
      publish('cells:changed');
    }

    return result;
  },

  get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);

    if (typeof value === 'object' && value !== null) {
      return new DeepProxy(value, handler, {
        // lib says it expects an array of strings, but it actually expects a dot separated string
        path: [...this.path, key.toString()].join('.') as unknown as string[],
      });
    }

    return value;
  }
};

const proxy = new DeepProxy({
  highlightedCell: null,
  mouseDown: false,
  revealed: false,
  debug: false,
  showControls: false,
  selectedCells: [],
  cells: [],
  historyCursor: 0,
  history: [],
}, handler);

export const state: State = proxy;
