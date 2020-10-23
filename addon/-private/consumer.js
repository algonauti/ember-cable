import { Consumer } from '@rails/actioncable';

export default class EmberCableConsumer extends Consumer {
  static createConsumer(url) {
    return new EmberCableConsumer(url);
  }

  createSubscription(channelName, mixin) {
    return this.subscriptions.create(channelName, mixin);
  }

  connectionIsOpen() {
    return this.connection.isOpen();
  }

  destroy() {
    // TODO
  }
}
