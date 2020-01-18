import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import { setupMirage } from "ember-cli-mirage/test-support";

module('Unit | Service | cable', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it creates a new consumer', async function(assert) {
    let service = this.owner.lookup('service:cable');
    let consumer = service.createConsumer('ws://localhost:4200/cable');

    later(self, function() {
      assert.ok(consumer.connectionIsOpen());
    }, 10);
  });

  test('it creates a new subscription', async function(assert) {
    let service = this.owner.lookup('service:cable');
    let consumer = service.createConsumer('ws://localhost:4200/cable');

    consumer.createSubscription('BroadcastChannel', {
      connected() {
        this.perform('echo');
      },
      received(data) {
        data = JSON.parse(data);
        assert.equal(data.action, 'echo');
      }
    });

    // Passing Parameters to Channel
    consumer.createSubscription({ channel: 'BroadcastChannel', room: 'BestRoom' }, {
      connected() {
        this.perform('echo', { foo: 'bar' });
      },
      received(data) {
        data = JSON.parse(data);
        assert.equal(data.action, 'echo');
        assert.equal(data.foo, 'bar');
      }
    });
  });
});
