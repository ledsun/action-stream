import assert from 'power-assert'
import {
  Writable
}
from 'stream'
import {
  ActionTransform
}
from '../src'
import * as driver from './driver'

describe('ActionTransform', () => {
  it('is pipe from Readable', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()
      }
      _transformAction(action, push) {
        assert.equal(action, driver.sampleAction)
        mochaDone()
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
      _transformAction(action, push) {}
    }

    let ats = new ActionTransformSample()

    ats._transform(driver.sampleAction, '', mochaDone)
    assert.throws(() => ats._transform(driver.sampleAction, '', () => {}))
  })

  it('is able to pipe a Writable', (mochaDone) => {
    let _transformActionCalled

    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()
      }
      _transformAction(action, push) {
        _transformActionCalled = true
      }
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        assert(_transformActionCalled, 'push actions after calling the _transformAction.')

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

  it('is able to push anothor action', (mochaDone) => {
    class PushOptionTransform extends ActionTransform {
      constructor() {
        super()
        this.name = 'PushOptionTransform'
      }
      _transformAction(action, push) {
        push({
          option: 'option1'
        })
        push({
          option: 'option2'
        })
      }
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
        this.count = 0
      }
      _write(chunk, encoding, done) {
        if (this.count === 0) {
          assert.notEqual(chunk, driver.sampleAction, 'an original action is not changed')
          assert.equal(chunk.target, driver.sampleAction.target)
          assert.equal(chunk.type, driver.sampleAction.type)
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return;
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
          return;
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

        mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new PushOptionTransform())
      .pipe(new WritableStub())
  })
})
