import { getOwner } from '@ember/application';
import Mixin from '@ember/object/mixin';
import { isEqual, typeOf, tryInvoke } from '@ember/utils';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import Ember from 'ember';
import Subscription from 'ember-cable/core/subscription';

const {
  get
} = Ember;

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
    get(this,'subscriptions').push(subscription);
    this.sendCommand(subscription, 'subscribe');
  },

  remove(subscription) {
    this.forget(subscription);
    if (!this.findAll(get(subscription, 'identifier')).length) {
      return this.sendCommand(subscription, 'unsubscribe');
    }
  },

  reload() {
    get(this,'subscriptions').forEach( (subscription) => {
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
    get(this,'subscriptions').removeObject(subscription);
  },

  findAll(identifier) {
    return get(this,'subscriptions').filter(function(item) {
      return get(item, 'identifier').toLowerCase() === identifier.toLowerCase();
    });
  },

  notifyAll(callbackName, ...args) {
    get(this,'subscriptions').forEach( (subscription) => {
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
    let identifier = get(subscription, 'identifier');
    if(isEqual(identifier, '_ping')) {
      get(this,'consumer.connection').isOpen();
    } else {
      get(this,'consumer').send({command, identifier});
    }
  }
});

Subscriptions[Ember.NAME_KEY] = 'Subscriptions';

export default Subscriptions;
