import {
  type BaseMixin,
  type ChannelNameWithParams,
  Consumer,
  type Subscription,
} from '@rails/actioncable';

/**
 * The websocket connection owned by an ActionCable consumer.
 * `@rails/actioncable` does not publish types for it.
 */
export interface CableConnection {
  isOpen: () => boolean;
  reopen: () => boolean | undefined;
}

export default class CableConsumer extends Consumer {
  declare readonly connection: CableConnection;

  get connectionIsOpen(): boolean {
    return this.connection.isOpen();
  }

  createSubscription<M extends BaseMixin = BaseMixin>(
    channelName: ChannelNameWithParams | string,
    mixin?: M & ThisType<Subscription & M>,
  ): Subscription & M {
    return this.subscriptions.create(channelName, mixin);
  }

  reopenConnection(): boolean | undefined {
    return this.connection.reopen();
  }
}
