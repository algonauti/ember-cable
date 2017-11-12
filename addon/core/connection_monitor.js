import { later } from '@ember/runloop';
import EmberObject from '@ember/object';
import Ember from 'ember';

const {
  set,
  get
} = Ember;

var ConnectionMonitor = EmberObject.extend({
  connection: null,
  stoppedAt: null,
  startedAt: null,
  pingedAt: null,
  disconnectedAt: null,
  staleThreshold: 6,
  reconnectAttempts: 0,

  init() {
    this._super(...arguments);
    this.start();
  },

  start() {
    this.reset();
    set(this, 'stoppedAt', null);
    set(this, 'startedAt', Date.now());
    this.poll();
  },

  connected() {
    this.reset();
    set(this,'pingedAt', Date.now());
    set(this,'disconnectedAt', null);
  },

  disconnected() {
    set(this,'disconnectedAt', Date.now());
  },

  ping() {
    set(this,'pingedAt', Date.now());
  },

  reset() {
    set(this,'reconnectAttempts', 0);
  },

  poll() {
    later(this, () => {
      this.reconnectIfStale();
      this.poll();
    }, this.interval());
  },

  interval() {
    return Math.max(3, Math.min(30, 5 * Math.log(get(this,'reconnectAttempts') + 1) )) * 1000;
  },

  reconnectIfStale() {
    if(this.connectionIsStale()) {
      this.incrementProperty('reconnectAttempts');
      if(!this.disconnectedRecently()) {
        get(this,'connection').reopen();
      }
    }
  },

  connectionIsStale() {
    return !get(this,'connection').isConnecting() && this.secondsSince(get(this,'pingedAt') || get(this,'startedAt')) > get(this,'staleThreshold');
  },

  disconnectedRecently() {
    return get(this,'disconnectedAt') && this.secondsSince(get(this,'disconnectedAt') ) < get(this,'staleThreshold');
  },

  secondsSince(time) {
    return (Date.now() - time) / 1000;
  }
});

ConnectionMonitor[Ember.NAME_KEY] = 'ConnectionMonitor';

export default ConnectionMonitor;
