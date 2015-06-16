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

    class ReadableDriver extends Readable {
      constructor() {
        super({
          "objectMode": true
        })

        this.push(sampleAction)
      }
      _read() {}
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
    class ReadableDriver extends Readable {
      constructor() {
        super({
          "objectMode": true
        })

        this.push(sampleAction)
      }
      _read() {}
    }

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
})
