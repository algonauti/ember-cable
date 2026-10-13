import Service from '@ember/service';

import Consumer from '../-private/consumer.ts';

export default class CableService extends Service {
  private _consumers: Consumer[] = [];

  createConsumer(url: string): Consumer {
    const consumer = new Consumer(url);

    if (consumer.connect()) {
      this._consumers.push(consumer);
    }

    return consumer;
  }

  willDestroy(): void {
    super.willDestroy();
    this._consumers.forEach((consumer) => consumer.disconnect());
  }
}

declare module '@ember/service' {
  interface Registry {
    cable: CableService;
  }
}
