import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { debug, inspect } from '@ember/debug';

export default class NotificationMessagesComponent extends Component {
  @service cable;

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
        debug( "received(data) -> " + inspect(data) );
      },
      disconnected() {
        debug("BroadcastChannel#disconnected");
      }
    });

    // Passing Parameters to Channel
    let subscription = consumer.createSubscription({ channel: 'BroadcastChannel', room: 'BestRoom' }, {
      connected() {
        this.perform('ping', { foo: 'bar' });
      },
      received: (data) => {
        this._updateRecord(data);
      }
    });

    setTimeout(() => {
      subscription.perform('ping', { foo: 'bar' });
    }, 3000);

    setTimeout(() => {
      this.cable.destroy();
    }, 9000);

  }

  _updateRecord(data) {
     debug( "updateRecord(data) -> " + inspect(data) );
   }
}
