import { debug } from '@ember/debug';
import Service from '@ember/service';

export default class NotificationService extends Service {
  notify(message) {
    debug('NotificationService#notify: ' + message);
  }
}
