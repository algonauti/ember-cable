import EmberObject from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import Subscriptions from '@algonauti/ember-cable/core/subscriptions';
import Connection from '@algonauti/ember-cable/core/connection';
import { get } from '@ember/object';

export default EmberObject.extend({
  // Services
  fastboot: service(),

  // Default Values
  url: null,

  isConnecting: readOnly('connection.isConnecting'),
  nextConnectionAt: readOnly('connection.nextConnectionAt'),

  init() {
    this._super(...arguments);
    this.subscriptions = Subscriptions.create(getOwner(this).ownerInjection(), { consumer: this });

    if (!get(this, 'fastboot.isFastBoot')) {
      this.connection = Connection.create(getOwner(this).ownerInjection(), { consumer: this });
    }
  },

  send(data) {
    if (this.connection) {
      this.connection.send(data);
    }
  },

  willDestroy() {
    this._super();
    this.subscriptions.destroy();

    if (this.connection) {
      this.connection.destroy();
    }
  }
});
