import DeepProxy, { DeepProxyHandler } from 'proxy-deep';

const handler: DeepProxyHandler<any> = {
  defineProperty(target, p, attributes) {
    if (this.path.includes('cells')) {
      console.log('redraw');
    }

    return Reflect.defineProperty(target, p, attributes);
  },

  set(target, prop, value, reciver) {
    if (this.path.includes('cells')) {
      console.log('redraw');
    }

    return Reflect.set(target, prop, value, reciver);
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
