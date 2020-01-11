import Service from '@ember/service';
import { debug } from '@ember/debug';

export default Service.extend({
  createConsumer(url) {
    debug(`createConsumer(${url})`);
  }
});
