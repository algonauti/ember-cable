import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import Subscriptions from 'ember-cable/core/subscriptions';
import Connection from 'ember-cable/core/connection';
import Ember from 'ember';

const {
  get,
  set
} = Ember;

export default EmberObject.extend({
  url: null,

  init() {
    this._super(...arguments);
    set(this,'subscriptions', Subscriptions.create(getOwner(this).ownerInjection(), { consumer: this }));
    set(this,'connection', Connection.create(getOwner(this).ownerInjection(), { consumer: this }));
  },

  send(data) {
    get(this,'connection').send(data);
  }

});
