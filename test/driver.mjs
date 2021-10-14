import {
  Readable
}
from 'stream'

export let sampleAction = {
  source: ['ReadableDriver'],
  target: 'any',
  type: 'some'
}

export class ReadableDriver extends Readable {
  constructor() {
    super({
      "objectMode": true
    })

    this.push(sampleAction)
  }
  _read() {}
}
