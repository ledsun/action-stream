import assert from 'power-assert'
import {
  Readable
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
})
