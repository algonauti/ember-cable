import { run } from '@ember/runloop';
import { tryInvoke, isEqual } from '@ember/utils';
import { getOwner } from '@ember/application';
import { capitalize } from '@ember/string';
import EmberObject, { set, get } from '@ember/object';
import ConnectionMonitor from 'ember-cable/core/connection_monitor';


export default EmberObject.extend({
  consumer: null,
  connected: false,
  _reopenTimer: null,

  init() {
    this._super(...arguments);
    this.open();
    this.monitor = ConnectionMonitor.create(getOwner(this).ownerInjection(), { connection: this });
  },

  send(data) {
    if(this.isOpen()) {
      get(this,'webSocket').send(JSON.stringify(data));
    }
  },

  open() {
    let ws = new WebSocket(get(this,'consumer.url'));

    ['open', 'close', 'error', 'message'].forEach( (eventName) => {
      ws[`on${eventName}`] = (event) => {
        tryInvoke(this, `on${capitalize(eventName)}`, [event]);
      };
    });

    set(this,'webSocket', ws);
  },

  close() {
    tryInvoke(get(this,'webSocket'), 'close');
  },

  reopen() {
    if(this.isClose()) {
      this.open();
    } else {
      this.close();
      this._reopenTimer = setTimeout(run.bind(this, 'reopen'), 500);
    }
  },

  willDestroy() {
    this._super();
    clearTimeout(this._reopenTimer);
    run(this.monitor, 'destroy');
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

  onMessage(event) {
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

  onOpen() {
    set(this,'connected', true);
    get(this,'consumer.subscriptions').reload();
  },

  onClose() {
    this.disconnect();
  },

  onError() {
    this.disconnect();
  }

});
