import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { debug, inspect } from '@ember/debug';

export default Component.extend({
  cable: service('cable'),

  init() {
    this._super(...arguments);
    this._setupConsumer();
  },

  _setupConsumer() {
    var consumer = this.get('cable').createConsumer('ws://localhost:4200/cable');

    consumer.subscriptions.create('NotificationChannel', {
      connected() {
        this.perform('hello', { foo: 'bar' });
        this.perform('hello');
      },
      received(data) {
        debug( "received(data) -> " + inspect(data) );
      },
      disconnected() {
        debug("NotificationChannel#disconnected");
      }
    });

    // Passing Parameters to Channel
    consumer.subscriptions.create({ channel: 'NotificationChannel', room: 'Best Room' }, {
      received: (data) => {
        this._updateRecord(data);
      }
    });
  },

  _updateRecord(data) {
    debug( "updateRecord(data) -> " + inspect(data) );
  }
});
