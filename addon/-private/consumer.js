import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { createConsumer } from '@rails/actioncable';

export default EmberObject.extend({
  toString() {
    return 'EmberCable::Consumer'
  },

  init() {
    this._super(...arguments);
    this._consumer = createConsumer(this.url);
  },

  connect() {
    return this._consumer.connect();
  },

  createSubscription(channelName, mixin) {
    let subscriptionHandler = EmberObject.extend(mixin).extend({
      toString() {
        return 'EmberCable::SubscriptionHandler'
      },
    }).create(getOwner(this).ownerInjection());

    return this._consumer.subscriptions.create(channelName, subscriptionHandler);
  }

}).reopenClass({
  createConsumer(owner, url) {
    return this.create(getOwner(owner).ownerInjection(), { url: url });
  }
});
