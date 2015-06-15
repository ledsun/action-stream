import assert from 'power-assert'
import {
  Writable
}
from 'stream'
import {
  ActionReadable
}
from '../src'

class ActionReadableSample extends ActionReadable {
  constructor(selector) {
    super(selector)
    this.name = 'ActionReadableSample'
  }
  _bindComponent(selector, push) {
    this.onClick = action => push(action)
  }
  click(action) {
    this.onClick(action)
  }
}

describe('ActionReadable', () => {
  it('is able to pipe a Writable', (mochaDone) => {
    let sampleAction = {
      target: 'any',
      type: 'some'
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        assert(chunk, sampleAction, 'an action is changed')
        done()
        mochaDone()
      }
    }

    let r = new ActionReadableSample()
    r.pipe(new WritableStub())
    r.click(sampleAction)
  })
})
