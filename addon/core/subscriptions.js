import { getOwner } from '@ember/application';
import Mixin from '@ember/object/mixin';
import { isEqual, typeOf, tryInvoke } from '@ember/utils';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import Ember from 'ember';
import Subscription from 'ember-cable/core/subscription';

var Subscriptions = EmberObject.extend({
  consumer: null,
  subscriptions: A(),

  create(channelName, mixin) {
    let params = isEqual(typeOf(channelName), 'object') ? channelName : { channel: channelName };
    return Subscription.extend(Mixin.create(mixin), {
      subscriptions: this, params: params
    }).create(getOwner(this).ownerInjection());
  },

  add(subscription) {
    this.get('subscriptions').push(subscription);
    this.sendCommand(subscription, 'subscribe');
  },

  remove(subscription) {
    this.forget(subscription);
    if (!this.findAll(subscription.get('identifier')).length) {
      return this.sendCommand(subscription, 'unsubscribe');
    }
  },

  reload() {
    this.get('subscriptions').forEach( (subscription) => {
      this.sendCommand(subscription, 'subscribe');
    });
  },

  reject(identifier) {
    this.findAll(identifier).forEach( (subscription) => {
      this.forget(subscription);
      this.notify(subscription, "rejected");
    });
  },

  forget(subscription) {
    this.get('subscriptions').removeObject(subscription);
  },

  findAll(identifier) {
    return this.get('subscriptions').filter(function(item) {
      return item.get('identifier').toLowerCase() === identifier.toLowerCase();
    });
  },

  notifyAll(callbackName, ...args) {
    this.get('subscriptions').forEach( (subscription) => {
      this.notify(subscription, callbackName, ...args);
    });
  },

  notify(subscription, callbackName, ...args) {
    let subscriptions;
    if (typeOf(subscription)  === 'string') {
      subscriptions = this.findAll(subscription);
    } else {
      subscriptions = [subscription];
    }

    subscriptions.forEach( (subscription) => {
      tryInvoke(subscription, callbackName, args);
    });
  },

  sendCommand(subscription, command) {
    let identifier = subscription.get('identifier');
    if(isEqual(identifier, '_ping')) {
      this.get('consumer.connection').isOpen();
    } else {
      this.get('consumer').send({command, identifier});
    }
  }
});

Subscriptions[Ember.NAME_KEY] = 'Subscriptions';

export default Subscriptions;
