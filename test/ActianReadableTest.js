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
  constructor(option) {
    super(null, option)
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
  let sampleAction = {
    target: 'any',
    type: 'some'
  }

  it('is able to pipe a Writable', (mochaDone) => {
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
        assert.equal(chunk.source, 'ActionReadableSample')
        done()
        mochaDone()
      }
    }

    let r = new ActionReadableSample()
    r.pipe(new WritableStub())
    r.click(sampleAction)
  })

  it('throws an exception when pushing to next steram is failed.', () => {
    let r = new ActionReadableSample({
      highWaterMark: 2
    })
    r.click(sampleAction)
    assert.throws(() => r.click(sampleAction))
  })
})
