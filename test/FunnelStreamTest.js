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
import * as driver from './driver'

/** @test {FunnelStream} */
describe('FunnelStream', () => {
  it('is able to print log of actions passed throgh.', (mochaDone) => {
    console.debug = (...rest) => {
      assert.equal(rest[0], 'FunnelStream')
      assert.equal(rest[1], driver.sampleAction)
    }

    class WritableStub extends Writable {
      constructor() {
        super({
          "objectMode": true
        })
      }
      _write(chunk, encoding, done) {
        // actions are not changed.
        assert.equal(chunk, driver.sampleAction, 'an original action is not changed')
        assert.deepEqual(chunk, driver.sampleAction, 'an original action is not changed')
        done()
        mochaDone()
      }
    }

    new driver.ReadableDriver()
      .pipe(new FunnelStream(true))
      .pipe(new WritableStub())
  })

  it('throws an exception when pushing to next stream is failed.', (mochaDone) => {
    let fs = new FunnelStream(false, {
      highWaterMark: 2
    })

    fs._transform(driver.sampleAction, '', mochaDone)
    assert.throws(() => fs._transform(driver.sampleAction, '', () => {}))
  })
})
