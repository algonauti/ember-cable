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
import Ember from 'ember';

export default Ember.Controller.extend({
  cableService: Ember.inject.service('cable'),
  consumer: null,

  setupConsumer: Ember.on('init', function() {
    var consumer = this.get('cableService').createConsumer('ws://localhost:4200/cable');

    consumer.subscriptions.create("NotificationChannel", {
      connected() {
        this.perform('hello', { foo: 'bar' });
        this.perform('hello');
      },
      received(data) {
        Ember.debug( "received(data) -> " + Ember.inspect(data) );
      },
      disconnected() {
        Ember.debug("NotificationChannel#disconnected");
      }
    });

    // Passing Parameters to Channel
    const subscription = consumer.subscriptions.create({ channel: 'NotificationChannel', room: 'Best Room' }, {
      received: (data) => {
        this.updateRecord(data);
      }
    });

    // Using mixin and inject your services
    var channelMixin = Ember.Mixin.create({
      store: Ember.inject.service(),

      received(data) {
        this.get("store").pushPayload(data);
      }
    });

    consumer.subscriptions.create({ channel: 'NotificationChannel' }, channelMixin);

    // Send actions to your Action Cable channel class
    subscription.perform("your_channel_action", { hey: "hello" });

    // Save consumer to controller to link up computed props
    this.set('consumer', consumer);
  }),

  updateRecord(data) {
    Ember.debug( "updateRecord(data) -> " + Ember.inspect(data) );
  },

  // Flag indicating a connection is being attempted
  isConnecting: Ember.computed.readOnly('consumer.isConnecting'),

  // Milliseconds until the next connection attempt
  nextConnectionAt: Ember.computed.readOnly('consumer.nextConnectionAt'),
});

```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

ember-cable is released under the [MIT License](http://www.opensource.org/licenses/MIT).
