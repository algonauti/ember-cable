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
// app/controllers/application.js
export default Controller.extend({

  cable: service(),
  consumer: null,
  // Flag indicating a connection is being attempted
  isConnecting: readOnly('consumer.isConnecting'),
  // Milliseconds until the next connection attempt
  nextConnectionAt: readOnly('consumer.nextConnectionAt'),

  init() {
    this._super(...arguments);
    this._setupConsumer();
  },

  _setupConsumer() {
    const consumer = get(this, 'cable').createConsumer('ws://localhost:4200/cable');

    consumer.subscriptions.create("NotificationChannel", {
      connected() {
        this.perform('hello', { foo: 'bar' });
        this.perform('hello');
      },
      received(data) {
        debug( "received(data) -> " + data );
      },
      disconnected() {
        debug("NotificationChannel#disconnected");
      }
    });

    // Set consumer in controller to link up computed props
    set(this, 'consumer', consumer);
  },

  willDestroy() {
    // Close websocket connection
    get(this, 'consumer').destroy();
  },

  _updateRecord(data) {
    debug( "updateRecord(data) -> " + data );
  }

});

```

Passing parameters to Channel and sending action to your Action Cable channel class:
```js
const subscription = consumer.subscriptions.create({
  channel: 'NotificationChannel',
  room: 'Best Room'
}, {
  received(data) {
    this._updateRecord(data);
  }
});

subscription.perform("your_channel_action", { hey: "hello" });
```
Using mixin and inject your services:
```js
const channelMixin = Mixin.create({
  store: service(),

  received(data) {
    get(this, "store").pushPayload(data);
  }
});

consumer.subscriptions.create({ channel: 'NotificationChannel' }, channelMixin);
```
Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

ember-cable is released under the [MIT License](http://www.opensource.org/licenses/MIT).
