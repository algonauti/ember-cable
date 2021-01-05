import { Consumer } from '@rails/actioncable';

export default class CableConsumer extends Consumer {

  get connectionIsOpen() {
    return this.connection.isOpen();
  }

  createSubscription(channelName, mixin) {
    return this.subscriptions.create(channelName, mixin);
  }

}
