import Ember from 'ember';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';

export default Ember.Object.extend({
  url: null,
  queue: null,

  setupConnection: Ember.on('init', function() {
    this.set('subscriptions', Subscriptions.create({ consumer: this }));
    this.set('connection', Connection.create({ consumer: this }));
    this.set('queue', []);
  }),

  send(data) {
    this.get('queue').push(data);
  },

  queueObserver: Ember.on('init', Ember.observer('queue.[]', 'connection.connected', function() {
    const connection = this.get('connection');
    const queue = this.get('queue');

    if (!connection || !connection.get('connected')) {
      return;
    }

    if (Ember.isEmpty(queue)) {
      return;
    }

    queue.forEach((data, index) => {
      connection.send(data);
      queue.splice(index, 1);
    });
  }))
});
