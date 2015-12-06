# ember-cable

This addon permit to work with actioncable easily into your ember.js application.
It's a port of the [rails/actioncable](https://github.com/rails/actioncable) coffeescript code.

### Installation

Installing the library into `package.json`:

```js
  "devDependencies": {
    "ember-cable": "algonauti/ember-cable"
  }
```


## Basic Usage

Once the addon is installed, __the cable service can be injected wherever
needed in the application__.

```js
// app/controllers/application.js
import Ember from 'ember';

export default Ember.Controller.extend({
  cableService: Ember.inject.service('cable'),

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
    consumer.subscriptions.create({ channel: 'NotificationChannel', room: 'Best Room' }, {
      received: (data) => {
        this.updateRecord(data);
      }
    });

  }),

  updateRecord(data) {
    Ember.debug( "updateRecord(data) -> " + Ember.inspect(data) );
  }
});

```
