import { module, test } from 'qunit';
import { createConsumer } from '@rails/actioncable';

module('actioncable as an es6 module', function () {
  test('it works', function (assert) {
    assert.ok(createConsumer);
  });
});
