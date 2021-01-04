import Service from '@ember/service';
import { debug, } from '@ember/debug';

export default class NotificationService extends Service {
  notify(message) {
    debug("NotificationService#notify: " + message);
  }
}
