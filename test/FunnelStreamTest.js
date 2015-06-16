import assert from 'power-assert'
import {
  Readable,
  Writable
}
from 'stream'
import {
  FunnelStream
}
from '../src'

describe('FunnelStream', () => {
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

  it('is able to print log of actions passed throgh.', (mochaDone) => {
    console.debug = (...rest) => {
      assert.equal(rest[0], 'FunnelStream')
      assert.equal(rest[1], sampleAction)
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        // actions are not changed.
        assert.equal(chunk, sampleAction, 'an original action is not changed')
        assert.deepEqual(chunk, sampleAction, 'an original action is not changed')
        done()
        mochaDone()
      }
    }

    new ReadableDriver()
      .pipe(new FunnelStream(true))
      .pipe(new WritableStub())
  })

  it('throws an exception when pushing to next stream is failed.', (mochaDone) => {
    let fs = new FunnelStream()

    fs._transform(sampleAction, '', mochaDone)
    assert.throws(() => fs._transform(sampleAction, '', mochaDone))
  })
})
