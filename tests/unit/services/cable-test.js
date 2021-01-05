import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import { setupMirage } from "ember-cli-mirage/test-support";

module('Unit | Service | cable', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach( function() {
    this.consumer = this.owner.lookup('service:cable').createConsumer(
      'ws://localhost:4200/cable'
    );
  });

  test('creates a new consumer', async function(assert) {
    later(self, () => {
      assert.ok(this.consumer.connectionIsOpen);
    }, 10);
  });

  test('creates a subscription without params', async function(assert) {
    this.consumer.createSubscription('BroadcastChannel', {
      connected() {
        this.perform('echo');
      },
      received(data) {
        data = JSON.parse(data);
        assert.equal(data.action, 'echo');
      }
    });
  });

  test('creates a subscription passing params', async function(assert) {
    this.consumer.createSubscription({ channel: 'BroadcastChannel', room: 'BestRoom' }, {
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
