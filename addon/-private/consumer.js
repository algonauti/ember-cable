import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { createConsumer } from '@rails/actioncable';

export default class Consumer extends EmberObject {
  static createConsumer(owner, url) {
    return this.create(getOwner(owner).ownerInjection(), { url: url });
  }

  toString() {
    return 'EmberCable::Consumer'
  }

  init() {
    this.super(...arguments);
    this._consumer = createConsumer(this.url);
  }

  connect() {
    return this._consumer.connect();
  }

  disconnect() {
    return this._consumer.disconnect();
  }

  connectionIsOpen() {
    return this._consumer.connection.getState() == 'open';
  }

  createSubscription(channelName, mixin) {
    let subscriptionHandler = EmberObject.extend(mixin).extend({
      toString() {
        return 'EmberCable::SubscriptionHandler'
      },
    }).create(getOwner(this).ownerInjection());

    return this._consumer.subscriptions.create(channelName, subscriptionHandler);
  }
}
