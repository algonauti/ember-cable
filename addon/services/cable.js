import { getOwner } from '@ember/application';
import Service from '@ember/service';
import Consumer from 'ember-cable/core/consumer';

export default Service.extend({

  createConsumer(url) {
    return Consumer.create(getOwner(this).ownerInjection(), { url: url });
  }

});
