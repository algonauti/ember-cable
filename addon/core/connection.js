import { later } from '@ember/runloop';
import { tryInvoke, isEqual } from '@ember/utils';
import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import Ember from 'ember';
import ConnectionMonitor from 'ember-cable/core/connection_monitor';

const {
  get,
  set
} = Ember;

export default EmberObject.extend({
  consumer: null,
  connected: false,

  init() {
    this._super(...arguments);
    this.open();
    set(this,'monitor', ConnectionMonitor.create(getOwner(this).ownerInjection(), { connection: this }));
  },

  send(data) {
    if(this.isOpen()) {
      get(this,'webSocket').send(JSON.stringify(data));
    }
  },

  open() {
    set(this,'webSocket', new WebSocket(get(this,'consumer.url')));
    for (var eventName in this.events) {
      get(this,'webSocket')[`on${eventName}`] = this.events[eventName].bind(this);
    }
  },

  close() {
    tryInvoke(get(this,'webSocket'), 'close');
  },

  reopen() {
    if(this.isClose()){
      this.open();
    } else {
      this.close();
      later(this, () => {
        this.open();
      }, 500);
    }
  },

  isClose() {
    return !this.isOpen();
  },

  isOpen() {
    return isEqual(get(this,'connected'), true) &&
      isEqual(get(this,'webSocket').readyState, get(this,'webSocket').OPEN);
  },

  isConnecting() {
    return isEqual(get(this,'webSocket').readyState, get(this,'webSocket').CONNECTING);
  },

  disconnect() {
    set(this,'connected', false);
    get(this,'consumer.subscriptions').notifyAll('disconnected');
  },

  events: {
    message(event) {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case 'welcome':
          get(this,'monitor').connected();
          break;
        case 'ping':
          get(this,'monitor').ping();
          break;
        case 'confirm_subscription':
          get(this,'consumer.subscriptions').notify(data.identifier, 'connected');
          break;
        case 'reject_subscription':
          get(this,'consumer.subscriptions').reject(data.identifier);
          break;
        default:
          get(this,'consumer.subscriptions').notify(data.identifier, 'received', data.message);
      }

    },

    open() {
      set(this,'connected', true);
      get(this,'consumer.subscriptions').reload();
    },

    close() {
      this.disconnect();
    },

    error() {
      this.disconnect();
    }
  }

});
