import Ember from 'ember';

var Subscription = Ember.Object.extend({
  subscriptions: null,  
  params: {},
  
  identifier: Ember.computed('params', function() {
    return JSON.stringify(this.get('params'));
  }),
    
  addToSubscriptions: Ember.on('init', function() {
    this.get('subscriptions').add(this);
  }),
  
  perform(action, data = {}) {
    data.action = action;
    this.send(data);
  },
  
  send(data) {
    this.get('subscriptions.consumer').send({
      command: 'message',
      identifier: this.get('identifier'),
      data: JSON.stringify(data)
    });
  }
  
});

Subscription[Ember.NAME_KEY] = 'Subscription';

export default Subscription;
