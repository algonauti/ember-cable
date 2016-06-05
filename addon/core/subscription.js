import Ember from 'ember';

var Subscription = Ember.Object.extend({
  subscriptions: null,
  params: {},

  identifier: Ember.computed('params', function() {
    return JSON.stringify(this.get('params'));
  }),

  init() {
    this._super(...arguments);
    this.get('subscriptions').add(this);
  },

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
  },

  unsubscribe() {
    return this.get('subscriptions').remove(this);
  }

});

Subscription[Ember.NAME_KEY] = 'Subscription';

export default Subscription;
