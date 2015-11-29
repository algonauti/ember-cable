import Ember from 'ember';

export default Ember.Controller.extend({
  cableService: Ember.inject.service('cable'),

  setupConsumer: Ember.on('init', function() {
    var consumer = this.get('cableService').createConsumer('ws://localhost:4200/cable');
    
    consumer.subscriptions.create("NotificationChannel", {
      connected() {
        this.perform('hello', { foo: 'bar' });
        this.perform('hello');
      },
      received(data) {
        Ember.debug( "received(data) -> " + Ember.inspect(data) );
      },
      disconnected() {
        Ember.debug("NotificationChannel#disconnected");
      }      
    });
    
    consumer.subscriptions.create("NotificationChannel", {
      received: (data) => {
        this.updateRecord(data)
      }
    });
    
  }),

  updateRecord(data) {
    Ember.debug( "updateRecord(data) -> " + Ember.inspect(data) );
  }
});
