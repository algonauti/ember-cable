import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';

export default EmberObject.extend({
  url: null,

  init() {
    this._super(...arguments);
    this.set('subscriptions', Subscriptions.create(getOwner(this).ownerInjection(), { consumer: this }));
    this.set('connection', Connection.create(getOwner(this).ownerInjection(), { consumer: this }));
  },

  send(data) {
    this.get('connection').send(data);
  }

});
