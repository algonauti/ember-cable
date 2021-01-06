import { Consumer } from '@rails/actioncable';

export default class CableConsumer extends Consumer {

  get connectionIsOpen() {
    return this.connection.isOpen();
  }

  reopenConnection() {
    return this.connection.reopen();
  }

  createSubscription(channelName, mixin) {
    return this.subscriptions.create(channelName, mixin);
  }

}
