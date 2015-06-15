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
    source: ['ReadableDriver']
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
})
