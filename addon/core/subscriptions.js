import Ember from 'ember';
import Subscription from 'ember-cable/core/subscription';

var Subscriptions = Ember.Object.extend({
  consumer: null,
  subscriptions: Ember.A(),

  create(channelName, mixin) {
    let params = Ember.isEqual(Ember.typeOf(channelName), 'object') ? channelName : { channel: channelName };
    return Subscription.extend(Ember.Mixin.create(mixin), {
      subscriptions: this, params: params
    }).create();
  },

  add(subscription) {
    this.get('subscriptions').push(subscription);
    this.sendCommand(subscription, 'subscribe');
  },

  reload() {
    this.get('subscriptions').forEach( (subscription) => {
      this.sendCommand(subscription, 'subscribe');
    });
  },

  reject(identifier) {
    this.findAll(identifier).forEach( (subscription) => {
      this.sendCommand(subscription, 'rejected');
    });
  },

  findAll(identifier) {
    return this.get('subscriptions').filter(function(item) {
      return item.get('identifier').toLowerCase().match(identifier.toLowerCase());
    });
  },

  notifyAll(callbackName, ...args) {
    this.get('subscriptions').forEach( (subscription) => {
      this.notify(subscription, callbackName, ...args);
    });
  },

  notify(subscription, callbackName, ...args) {
    let subscriptions;
    if (Ember.typeOf(subscription)  === 'string') {
      subscriptions = this.findAll(subscription);
    } else {
      subscriptions = [subscription];
    }

    subscriptions.forEach( (subscription) => {
      Ember.tryInvoke(subscription, callbackName, args);
    });
  },

  sendCommand(subscription, command) {
    let identifier = subscription.get('identifier');
    if(Ember.isEqual(identifier, '_ping')) {
      this.get('consumer.connection').isOpen();
    } else {
      this.get('consumer').send({command, identifier});
    }
  }

});

Subscriptions[Ember.NAME_KEY] = 'Subscriptions';

export default Subscriptions;
