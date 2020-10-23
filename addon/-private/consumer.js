import { Consumer } from '@rails/actioncable';

export default class EmberCableConsumer extends Consumer {
  static createConsumer(url) {
    return new EmberCableConsumer(url);
  }

  get connectionIsOpen() {
    return this.connection.isOpen();
  }

  createSubscription(channelName, mixin) {
    return this.subscriptions.create(channelName, mixin);
  }

  destroy() {
    // TODO
  }
}
