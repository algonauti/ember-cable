import Ember from 'ember';

var ConnectionMonitor = Ember.Object.extend({
  connection: null,
  stoppedAt: null,
  startedAt: null,
  pingedAt: null,
  disconnectedAt: null,
  staleThreshold: 6,
  reconnectAttempts: 0,
  enabled: true,

  init() {
    this._super(...arguments);
    this.start();
  },

  start() {
    this.reset();
    this.set('stoppedAt', null);
    this.set('startedAt', Date.now());
    this.poll();
  },

  connected() {
    this.reset();
    this.set('pingedAt', Date.now());
    this.set('disconnectedAt', null);
  },

  disconnected() {
    this.set('disconnectedAt', Date.now());
  },

  enable() {
    this.set('enabled', true);
  },

  disable() {
    this.set('enabled', false);
  },

  ping() {
    this.set('pingedAt', Date.now());
  },

  reset() {
    this.set('reconnectAttempts', 0);
  },

  poll() {
    Ember.run.later(this, () => {
      if (this.get('enabled')) {
        this.reconnectIfStale();
        this.poll();
      }
    }, this.interval());
  },

  interval() {
    return Math.max(3, Math.min(30, 5 * Math.log(this.get('reconnectAttempts') + 1) )) * 1000;
  },

  reconnectIfStale() {
    if(this.connectionIsStale()) {
      this.incrementProperty('reconnectAttempts');
      if(!this.disconnectedRecently()) {
        this.get('connection').reopen();
      }
    }
  },

  connectionIsStale() {
    return this.secondsSince(this.get('pingedAt') || this.get('startedAt')) > this.get('staleThreshold');
  },

  disconnectedRecently() {
    return this.get('disconnectedAt') && this.secondsSince(this.get('disconnectedAt') ) < this.get('staleThreshold');
  },

  secondsSince(time) {
    return (Date.now() - time) / 1000;
  }
});

ConnectionMonitor[Ember.NAME_KEY] = 'ConnectionMonitor';

export default ConnectionMonitor;
