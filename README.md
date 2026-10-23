# ember-cable

This add-on enables simple integration of Rails Action Cable into Ember apps.

[![CI](https://github.com/algonauti/ember-cable/workflows/CI/badge.svg)](https://github.com/algonauti/ember-cable/actions)
[![Ember Observer Score](https://emberobserver.com/badges/-algonauti-ember-cable.svg)](https://emberobserver.com/addons/@algonauti/ember-cable)

> **v2.0.0** is published as a [v2 addon](https://github.com/embroider-build/embroider/blob/main/docs/v2-faq.md) (Embroider format). It requires `ember-auto-import` >= 2 and Ember >= 4.12. Repository layout: `ember-cable/` (the addon) and `test-app/` (tests).

### Installation
run the following command from inside your ember-cli project:

    ember install @algonauti/ember-cable

## Basic Usage

Once the addon is installed, the cable service can be injected wherever
needed in the application.

```js
// test-app/app/components/notification-messages/component.js
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
### Subprotocols

`createConsumer` accepts an optional list of WebSocket subprotocols, offered on the handshake next to Action Cable's own:

```js
this.cable.createConsumer('ws://localhost:4200/cable', ['my-auth-token']);
```

## TypeScript

The addon is written in TypeScript and ships its own type declarations.

```ts
import Component from '@glimmer/component';
import { service } from '@ember/service';
import type CableService from '@algonauti/ember-cable/services/cable';

export default class Notifications extends Component {
  @service declare cable: CableService;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const consumer = this.cable.createConsumer('ws://localhost:4200/cable');

    consumer.createSubscription('BroadcastChannel', {
      connected() {
        this.perform('ping');
      },
      received(data: unknown) {
        console.log(data);
      },
    });
  }
}
```

`Consumer`, `CableService` and the ActionCable types (`BaseMixin`, `ChannelNameWithParams`, `Subscription`, `Subscriptions`) are also exported from `@algonauti/ember-cable`.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

ember-cable is released under the [MIT License](http://www.opensource.org/licenses/MIT).
