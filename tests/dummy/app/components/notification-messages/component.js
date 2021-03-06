import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { debug, inspect } from '@ember/debug';
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';

export default class NotificationMessagesComponent extends Component {
  @service cable;
  @service notification;

  constructor() {
    super(...arguments);
    this._setupConsumer();
  }

  _setupConsumer() {
    let consumer = this.cable.createConsumer('ws://localhost:4200/cable');

    consumer.createSubscription('BroadcastChannel', {
      connected() {
        debug('BroadcastChannel#connected');
        this.perform('ping');
      },
      received(data) {
        debug('received(data) -> ' + inspect(data));
      },
      disconnected() {
        debug('BroadcastChannel#disconnected');
      },
    });

    // Passing Parameters to Channel
    let subscription = consumer.createSubscription(
      { channel: 'BroadcastChannel', room: 'BestRoom' },
      {
        connected() {
          this.perform('ping', { foo: 'bar' });
        },
        received: (data) => {
          this._updateRecord(data);
        },
        disconnected: () => {
          this.notification.notify('BroadcastChannel#disconnected');
        },
      }
    );

    /* eslint-disable */
    // Using mixin and inject your services:
    let subscriptionHandler = EmberObject.extend({
      notification2: service('notification'),

      connected() {
        this.notification2.notify("subscriptionHandler#connected");
      },
    }).create(getOwner(this).ownerInjection());

    consumer.createSubscription({ channel: 'BroadcastChannel' }, subscriptionHandler);
    /* eslint-enable */

    setTimeout(() => {
      subscription.perform('ping', { foo: 'bar' });
    }, 3000);

    setTimeout(() => {
      this.cable.destroy();
    }, 9000);
  }

  _updateRecord(data) {
    debug('updateRecord(data) -> ' + inspect(data));
  }
}
