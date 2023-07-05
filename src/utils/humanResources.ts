import BoardGenerator from '~/workers/boardGenerator?worker';
import Tipper from '~/workers/tipper?worker';

type RegisteredWorkers = 'boardGenerator' | 'tipper';

const workers: Record<RegisteredWorkers, Worker> = {
  tipper: new Tipper(),
  boardGenerator: new BoardGenerator(),
};

export const delegateTaskTo = async (name: RegisteredWorkers, args: any): Promise<any> => {
  if (window.Worker) {
    const worker = workers[name];

    worker.postMessage(args);

    return new Promise((resolve) => {
      const listener = (message: MessageEvent) => {
        try {
          const response = JSON.parse(message.data);
          resolve(response);
        } catch {
          resolve(message.data);
        } finally {
          worker.removeEventListener('message', listener);
        }
      };

      worker.addEventListener('message', listener);
    });
  }

  throw new Error(`${name} is skipping work`);
};
