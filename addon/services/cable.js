import Service from '@ember/service';
import Consumer from '@algonauti/ember-cable/-private/consumer';

export default class CableService extends Service {

  constructor(...args) {
    super(...args);
    this._consumers = [];
  }

  createConsumer(url) {
    let consumer = Consumer.createConsumer(url);

    if (consumer.connect()) {
      this._consumers.push(consumer);
    }
    return consumer;
  }

  willDestroy() {
    this.super();
    this._consumers.forEach(consumer => consumer.destroy());
  }
}
