import assert from 'power-assert'
import {
  Readable,
  Writable
}
from 'stream'
import {
  TailStream
}
from '../index.mjs'
import * as driver from './driver.mjs'

/** @test {TailStream} */
describe('TailStream', () => {
  it('is able to print log of actions passed throgh.', (mochaDone) => {
    console.log = (...rest) => {
      assert.equal(rest[0], 'TailStream')
      assert.equal(rest[1], driver.sampleAction)
      mochaDone()
    }

    new driver.ReadableDriver()
      .pipe(new TailStream(true))
  })
})
