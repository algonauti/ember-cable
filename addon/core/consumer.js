import Ember from 'ember';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';
import ConnectionMonitor from 'ember-cable/subscriptions/connection_monitor';

export default Ember.Object.extend({
  url: null,

  setupConnection: Ember.on('init', function() {
    this.set('subscriptions', Subscriptions.create({ consumer: this }));
    this.set('connection', Connection.create({ consumer: this }));
    this.set('connectionMonitor', ConnectionMonitor.create({ consumer: this }));
  }),

  send(data) {
    this.get('connection').send(data);
  }
});
