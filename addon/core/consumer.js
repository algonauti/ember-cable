import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';

export default EmberObject.extend({
  url: null,

  init() {
    this._super(...arguments);
    this.subscriptions = Subscriptions.create(getOwner(this).ownerInjection(), { consumer: this });
    this.connection = Connection.create(getOwner(this).ownerInjection(), { consumer: this });
  },

  send(data) {
    this.connection.send(data);
  },

  willDestroy() {
    this._super();
    this.connection.destroy();
    this.subscriptions.destroy();
  }
});
