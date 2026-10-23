import { adapters } from '@rails/actioncable';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | cable', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.consumer = this.owner
      .lookup('service:cable')
      .createConsumer('ws://localhost:4200/cable');
  });

  test('creates a new consumer', async function (assert) {
    assert.expect(1);
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.ok(this.consumer.connectionIsOpen);
  });

  test('creates a subscription without params', async function (assert) {
    assert.expect(1);
    this.consumer.createSubscription('BroadcastChannel', {
      connected() {
        this.perform('echo');
      },
      received(data) {
        data = JSON.parse(data);
        assert.equal(data.action, 'echo');
      },
    });
  });

  test('creates a subscription passing params', async function (assert) {
    assert.expect(2);
    this.consumer.createSubscription(
      { channel: 'BroadcastChannel', room: 'BestRoom' },
      {
        connected() {
          this.perform('echo', { foo: 'bar' });
        },
        received(data) {
          data = JSON.parse(data);
          assert.equal(data.action, 'echo');
          assert.equal(data.foo, 'bar');
        },
      },
    );
  });

  test('offers the given subprotocols after the Action Cable ones', function (assert) {
    const handshakes = [];
    const { WebSocket } = adapters;
    adapters.WebSocket = class extends WebSocket {
      constructor(url, protocols) {
        super(url, protocols);
        handshakes.push(protocols);
      }
    };

    try {
      this.owner
        .lookup('service:cable')
        .createConsumer('ws://localhost:4200/cable', ['token.abc']);
    } finally {
      adapters.WebSocket = WebSocket;
    }

    assert.deepEqual(handshakes, [
      ['actioncable-v1-json', 'actioncable-unsupported', 'token.abc'],
    ]);
  });
});
