import assert from 'power-assert'
import {
  Readable,
  Writable
}
from 'stream'
import {
  TailStream
}
from '../src'
import * as driver from './driver'

/** @test {TailStream} */
describe('TailStream', () => {
  it('is able to print log of actions passed throgh.', (mochaDone) => {
    console.debug = (...rest) => {
      assert.equal(rest[0], 'TailStream')
      assert.equal(rest[1], driver.sampleAction)
      mochaDone()
    }

    new driver.ReadableDriver()
      .pipe(new TailStream(true))
  })
})
