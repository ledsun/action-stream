import assert from 'power-assert'
import {
  Readable,
  Writable
}
from 'stream'
import {
  ActionTransform
}
from '../src'

describe('ActionTransform', () => {
  let sampleAction = {
    source: ['ReadableDriver'],
    target: 'any',
    type: 'some'
  }

  class ReadableDriver extends Readable {
    constructor() {
      super({
        "objectMode": true
      })

      this.push(sampleAction)
    }
    _read() {}
  }

  it('is pipe from Readable', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()
      }
      _transformAction(action, push) {
        assert.equal(action, sampleAction)
        mochaDone()
      }
    }

    new ReadableDriver().pipe(
      new ActionTransformSample()
    )
  })

  it('throws an exception when pushing to next stream is failed.', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()
      }
      _transformAction(action, push) {}
    }

    let ats = new ActionTransformSample()

    ats._transform(sampleAction, '', mochaDone)
    assert.throws(() => ats._transform(sampleAction, '', mochaDone))
  })

  it('is able to pipe a Writable', (mochaDone) => {
    class ActionTransformSample extends ActionTransform {
      constructor() {
        super()
      }
      _transformAction(action, push) {}
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        // Copy of an original action is pushed.
        assert.notEqual(chunk, sampleAction, 'an original action is not changed')
        assert.equal(chunk.target, sampleAction.target)
        assert.equal(chunk.type, sampleAction.type)
        assert.equal(chunk.source, 'ReadableDriver')
        done()
        mochaDone()
      }
    }

    new ReadableDriver()
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
          assert.notEqual(chunk, sampleAction, 'an original action is not changed')
          assert.equal(chunk.target, sampleAction.target)
          assert.equal(chunk.type, sampleAction.type)
          assert.equal(chunk.source, 'ReadableDriver')
          this.count++;
          done()
          return;
        }

        if (this.count === 1) {
          // Remain original values.
          assert.equal(chunk.target, sampleAction.target)
          assert.equal(chunk.type, sampleAction.type)
          // Add source.
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option1')
          this.count++;
          done()
          return;
        }

        if (this.count === 2) {
          // Push multiple actions.
          assert.equal(chunk.target, sampleAction.target)
          assert.equal(chunk.type, sampleAction.type)
          assert.deepEqual(chunk.source, ['ReadableDriver', 'PushOptionTransform'])
          assert.equal(chunk.option, 'option2')
          this.count++;
          done()
        }

        mochaDone()
      }
    }

    new ReadableDriver()
      .pipe(new PushOptionTransform())
      .pipe(new WritableStub())
  })
})
