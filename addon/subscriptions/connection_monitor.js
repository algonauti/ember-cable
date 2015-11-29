import Ember from 'ember';
import Subscription from 'ember-cable/core/subscription';

var ConnectionMonitor = Subscription.extend({
  consumer: null,
  identifier: '_ping',
  
  stoppedAt: null,
  startedAt: null,
  pingedAt: null,
  disconnectedAt: null,

  reconnectAttempts: 0,
    
  addToSubscriptions: Ember.on('init', function() {
    this.get('consumer.subscriptions').add(this);
  }),
  
  startMonitor: Ember.on('init', function() {
    this.reset();
    this.set('stoppedAt', null);
    this.set('startedAt', Date.now());
    this.poll();
  }),
  
  disconnected() {
    this.set('disconnectedAt', Date.now());
  },
  
  received() {
    this.set('pingedAt', Date.now());
  },
  
  reset() {
    this.set('reconnectAttempts', 0);
  },
  
  poll() {
    Ember.run.later(this, () => {
      this.reconnectIfStale();
      this.poll();
    }, this.interval());
  },
  
  interval() {
    return Math.max(3, Math.min(30, 5 * Math.log(this.get('reconnectAttempts') + 1) )) * 1000;
  },
  
  reconnectIfStale() {
    if(this.connectionIsStale()) {
      this.incrementProperty('reconnectAttempts');
      if(!this.disconnectedRecently()) {
        this.get('consumer.connection').reopen();
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
