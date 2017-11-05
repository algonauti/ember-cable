import { debug, inspect } from '@ember/debug';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  cableService: service('cable'),

  setupConsumer: on('init', function() {
    var consumer = this.get('cableService').createConsumer('ws://localhost:4200/cable');

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
        this.updateRecord(data);
      }
    });

  }),

  updateRecord(data) {
    debug( "updateRecord(data) -> " + inspect(data) );
  }
});
