# ember-cable

This add-on enables simple integration of Rails Action Cable into Ember apps.

[![Build Status](https://travis-ci.org/algonauti/ember-cable.svg?branch=master)](https://travis-ci.org/algonauti/ember-cable)
[![Ember Observer Score](https://emberobserver.com/badges/-algonauti-ember-cable.svg)](https://emberobserver.com/addons/@algonauti/ember-cable)

### Installation
run the following command from inside your ember-cli project:

    ember install @algonauti/ember-cable

## Basic Usage

Once the addon is installed, the cable service can be injected wherever
needed in the application.

```js
// tests/dummy/app/components/notification-messages/component.js
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { debug, inspect } from '@ember/debug';
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';

export default class NotificationMessagesComponent extends Component {
  @service cable;
  @service notification;

  constructor() {
    super(...arguments);
    this._setupConsumer();
  }

  _setupConsumer() {
    let consumer = this.cable.createConsumer('ws://localhost:4200/cable');

    consumer.createSubscription('BroadcastChannel', {
      connected() {
        debug('BroadcastChannel#connected');
        this.perform('ping');
      },
      received(data) {
        debug( "received(data) -> " + inspect(data) );
      },
      disconnected() {
        debug("BroadcastChannel#disconnected");
      }
    });

    // Passing Parameters to Channel
    let subscription = consumer.createSubscription({ channel: 'BroadcastChannel', room: 'BestRoom' }, {
      connected() {
        this.perform('ping', { foo: 'bar' });
      },
      received: (data) => {
        this._updateRecord(data);
      },
      disconnected: () => {
        this.notification.notify("BroadcastChannel#disconnected");
      }
    });

    // Using mixin and inject your services:
    let subscriptionHandler = EmberObject.extend({
      notification2: service('notification'),

      connected() {
        this.notification2.notify("subscriptionHandler#connected");
      },
    }).create(getOwner(this).ownerInjection());

    consumer.createSubscription({ channel: 'BroadcastChannel' }, subscriptionHandler);

    setTimeout(() => {
      subscription.perform('ping', { foo: 'bar' });
    }, 3000);

    setTimeout(() => {
      this.cable.destroy();
    }, 9000);

  }

  _updateRecord(data) {
     debug( "updateRecord(data) -> " + inspect(data) );
   }
}
```
Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

ember-cable is released under the [MIT License](http://www.opensource.org/licenses/MIT).
