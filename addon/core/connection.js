import { later } from '@ember/runloop';
import { tryInvoke, isEqual } from '@ember/utils';
import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import ConnectionMonitor from 'ember-cable/core/connection_monitor';

export default EmberObject.extend({
  consumer: null,
  connected: false,

  init() {
    this._super(...arguments);
    this.open();
    this.set('monitor', ConnectionMonitor.create(getOwner(this).ownerInjection(), { connection: this }));
  },

  send(data) {
    if(this.isOpen()) {
      this.get('webSocket').send(JSON.stringify(data));
    }
  },

  open() {
    this.set('webSocket', new WebSocket(this.get('consumer.url')));
    for (var eventName in this.events) {
      this.get('webSocket')[`on${eventName}`] = this.events[eventName].bind(this);
    }
  },

  close() {
    tryInvoke(this.get('webSocket'), 'close');
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
    return isEqual(this.get('connected'), true) &&
      isEqual(this.get('webSocket').readyState, this.get('webSocket').OPEN);
  },

  isConnecting() {
    return isEqual(this.get('webSocket').readyState, this.get('webSocket').CONNECTING);
  },

  disconnect() {
    this.set('connected', false);
    this.get('consumer.subscriptions').notifyAll('disconnected');
  },

  events: {
    message(event) {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case 'welcome':
          this.get('monitor').connected();
          break;
        case 'ping':
          this.get('monitor').ping();
          break;
        case 'confirm_subscription':
          this.get('consumer.subscriptions').notify(data.identifier, 'connected');
          break;
        case 'reject_subscription':
          this.get('consumer.subscriptions').reject(data.identifier);
          break;
        default:
          this.get('consumer.subscriptions').notify(data.identifier, 'received', data.message);
      }

    },

    open() {
      this.set('connected', true);
      this.get('consumer.subscriptions').reload();
    },

    close() {
      this.disconnect();
    },

    error() {
      this.disconnect();
    }
  }

});
