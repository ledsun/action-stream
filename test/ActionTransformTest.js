import assert from 'power-assert'
import {
  Writable,
  Readable
}
from 'stream'
import Promise from 'bluebird'
import {
  ActionTransform
}
from '../src'
import * as driver from './driver'

/** @test {ActionTransform} */
describe('ActionTransform', () => {
  it('is pipe from Readable', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()

        this.bindActions('any', [
          ['some', (action) => {
            assert.equal(action, driver.sampleAction)
            mochaDone()
          }]
        ])
      }
    }

    new driver.ReadableDriver().pipe(
      new ActionTransformSample()
    )
  })

  it('throws an exception when pushing to next stream is failed.', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super({
          highWaterMark: 2
        })
      }
    }

    let ats = new ActionTransformSample()

    ats._transform(driver.sampleAction, '', mochaDone)
    assert.throws(() => ats._transform(driver.sampleAction, '', () => {}))
  })

  it('is able to pipe a Writable', (mochaDone) => {
    let _handlerCalled

    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()

        this.bindActions('any', [
          ['some', () => _handlerCalled = true]
        ])
      }
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        assert(_handlerCalled, 'push actions after calling the handler.')

        // Copy of an original action is pushed.
        assert.notEqual(chunk, driver.sampleAction, 'an original action is not changed')
        assert.equal(chunk.target, driver.sampleAction.target)
        assert.equal(chunk.type, driver.sampleAction.type)
        assert.equal(chunk.source, 'ReadableDriver')
        done()
        mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new ActionTransformSample())
      .pipe(new WritableStub())
  })

  it('is able to push another action', (mochaDone) => {
    class PushOptionTransform extends ActionTransform {
      constructor() {
        super()
        this.name = 'PushOptionTransform'

        this.bindActions('any', [
          ['some', (action, push) => {
            push({
              option: 'option1'
            })
            push({
              option: 'option2'
            })
          }]
        ])
      }
    }

    class AssertDoublePushWritableStub extends Writable {
      constructor(mochaDone) {
        super({
          "objectMode": true
        })
        this.count = 0
        this.mochaDone = mochaDone
      }
      _write(chunk, encoding, done) {
        if (this.count === 0) {
          assert.notEqual(chunk, driver.sampleAction, 'an original action is not changed')
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, driver.sampleAction.type)
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return
        }

        if (this.count === 1) {
          // Remain original values.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, driver.sampleAction.type)
            // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option1')
          this.count++;
          done()
          return
        }

        if (this.count === 2) {
          // Push multiple actions.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, driver.sampleAction.type)
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option2')
          this.count++;
          done()
        }

        this.mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new PushOptionTransform())
      .pipe(new AssertDoublePushWritableStub(mochaDone))
  })

  it('is able to forward action to another target', (mochaDone) => {
    class ForwardActionTransform extends ActionTransform {
      constructor() {
        super()
        this.name = 'ForwardActionTransform'

        this.bindActions('any', [
          ['some', (action, push) => push('another target')]
        ])
      }
    }

    class AssertForwardWritableStub extends Writable {
      constructor(mochaDone) {
        super({
          "objectMode": true
        })
        this.count = 0
        this.mochaDone = mochaDone
      }
      _write(chunk, encoding, done) {
        if (this.count === 0) {
          assert.notEqual(chunk, driver.sampleAction, 'an original action is not changed')
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, driver.sampleAction.type)
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return
        }

        if (this.count === 1) {
          // Remain original values.
          assert.equal(chunk.target, 'another target')
          assert.equal(chunk.type, driver.sampleAction.type)
            // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'ForwardActionTransform'])
          this.count++;
          done()
        }

        this.mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new ForwardActionTransform())
      .pipe(new AssertForwardWritableStub(mochaDone))
  })

  it('is able to push promise action', (mochaDone) => {
    class PushOptionTransform extends ActionTransform {
      constructor() {
        super()
        this.name = 'PushOptionTransform'

        this.bindActions('any', [
          ['some', (action, push) => {
            push(new Promise((resolve, reject) => {
              setTimeout(() => resolve({
                option: 'option1'
              }), 0)
            }))

            push({
              option: 'option2'
            })

            // forward with Promise.
            push(new Promise((resolve, reject) => {
              setTimeout(() => resolve('another target'), 0)
            }))
          }]
        ])
      }
    }

    class AssertPushPromiseWritableStub extends Writable {
      constructor(mochaDone) {
        super({
          "objectMode": true
        })
        this.count = 0
        this.mochaDone = mochaDone
      }
      _write(chunk, encoding, done) {
        if (this.count === 0) {
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return
        }

        if (this.count === 1) {
          // A sync aciton is fast.
          assert.equal(chunk.option, 'option2')
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          this.count++;
          done()
          return
        }

        if (this.count === 2) {
          // An async aciton is slow.
          assert.equal(chunk.option, 'option1')
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          this.count++;
          done()
          return
        }

        if (this.count === 3) {
          assert.equal(chunk.target, 'another target')
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          this.count++;
          done()
        }

        this.mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new PushOptionTransform())
      .pipe(new AssertPushPromiseWritableStub(mochaDone))
  })

  it('is able to bind multi actions', (mochaDone) => {
    class MultiTypeReadableDriver extends Readable {
      constructor() {
        super({
          "objectMode": true
        })

        this.push({
          source: ['ReadableDriver'],
          target: 'any',
          type: 'prototype'
        })
        this.push({
          source: ['ReadableDriver'],
          target: 'any',
          type: 'delete'
        })
      }
      _read() {}
    }

    class PushOptionTransform extends ActionTransform {
      constructor() {
        super()
        this.name = 'PushOptionTransform'
        this.bindActions('any', [
          ['prototype', (action, push) => {
            push({
              option: 'option1'
            })
          }],
          ['delete', (action, push) => {
            push({
              option: 'option2'
            })
          }],
          ['delete', (aciton, push) => {
            push({
              option: 'option3'
            })
          }]
        ])
      }
    }

    class AssertFourthPushWritableStub extends Writable {
      constructor(mochaDone) {
        super({
          "objectMode": true
        })
        this.count = 0
        this.mochaDone = mochaDone
      }
      _write(chunk, encoding, done) {
        if (this.count === 0) {
          assert.notEqual(chunk, driver.sampleAction, 'an original action is not changed')
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, 'prototype')
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return
        }

        if (this.count === 1) {
          // Remain original values.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, 'delete')
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return
        }

        if (this.count === 2) {
          // Remain original values.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, 'prototype')
            // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option1')
          this.count++;
          done()
          return
        }

        if (this.count === 3) {
          // Push multiple actions.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, 'delete')
            // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option2')
          this.count++;
          done()
          return
        }

        if (this.count === 4) {
          // Remain original values.
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, 'delete')
            // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option3')
          this.count++;
          done()
        }

        this.mochaDone()
      }
    }

    new MultiTypeReadableDriver()
      .pipe(new PushOptionTransform())
      .pipe(new AssertFourthPushWritableStub(mochaDone))
  })
})
