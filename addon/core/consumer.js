import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';
import { get } from '@ember/object';

export default EmberObject.extend({
  // Services
  fastboot: service(),

  // Default Values
  url: null,

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
