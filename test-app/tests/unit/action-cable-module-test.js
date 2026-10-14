import { createConsumer } from '@rails/actioncable';
import { module, test } from 'qunit';

module('actioncable as an es6 module', function () {
  test('it works', function (assert) {
    assert.ok(createConsumer);
  });
});
