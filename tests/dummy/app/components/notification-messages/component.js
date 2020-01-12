import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  cable: service('cable'),

  init() {
    this._super(...arguments);
    this._setupConsumer();
  },

  _setupConsumer() {
    this.get('cable').createConsumer('ws://localhost:4200/cable');
  }
});
