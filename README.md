# action-stream

It is a library for realizing **Model - View - Stream** architecture.

## Purpose
You can realize the Uni-direction data flow architecture using the Node Stream API.
Presentation logic can be divided into multiple modules with common API.

All events of user intaraction and model modification are convert as a action objet.
Actions flow in the stream.
Modules of this architecture are in the stream.
They respond to actions that have flowed through the stream.

The amount of source code increases.

## See also

[Model View Streamのご提案 - Qiita](http://qiita.com/ledsun/items/0c27a0bcbd7e738faac1) (Japanese)

## Usage
### Setup
`npm install action-stream`

### Classes
#### ActionReadable
It converts View(user intaraction) events to actions and pushes that actions to the stream.

An action is an object with target property and type property.

example:

```js
import {
  ActionReadable
}
from 'action-stream'

export default class extends ActionReadable {
  constructor(selector) {
    super(selector)
    this.name = 'ActionReaderSample'
  }
  _bindComponent(selector, push) {
    let component = document.querySelector(selector)

    component
      .querySelector('.button')
      .addEventListener('click', e => push({
        target: 'some',
        type: 'any'
      }))
}
```

#### FunnelStream

It bundles multiple action streams into the stream.

example:

```js
import {
  FunnelStream
}
from 'action-stream'
import ActionStream1 from './ActionStream1'
import ActionStream2 from './ActionStream2'

let funnel = new FunnelStream(true)

new ActionStream1(selector.INPUT_NODE).pipe(funnel)
new ActionStream2(selector.EDIT_NODE).pipe(funnel)

export default funnel
```

If you set the first argument of the constructor to `true`, it output passing actions by `console.log`.

#### ActionTransform

It responds to the action flowing through the stream and modify the Model and View.

##### Example 1 Model

Whether it reacts to an action is distinguished by the action's taget and type.

Specify a target to react to the first argument of bindActions method.
The second argument to the bindActions method is an array consisting of a pair of type and a function to be executed.

The arguments of the callback function are the received action and the function to flow the action to the stream.

```js
import {
  ActionTransform
}
from 'action-stream'

export default class extends ActionTransform {
  constructor(model) {
    super()
    this.name = 'ModelStream'

    this.bindActions('same', [
      ['any', (action, push) => madel.doAnything(action)]
    ])
  }
}
```

##### Example 2 View

```js
import {
  ActionTransform
}
from 'action-stream'

export default class extends ActionTransform {
  constructor(selector) {
    super()
    let component = document.querySelectorAll(selector)

    bindActions('same', [
      ['any', (action, push) => {
        if (action.type === 'any')
          _component.innerHTML = `<div>${action.target}<div>`
      }]
    ])
  }
}
```


#### TailStream
It terminate the stream.

example:
```js
import {
  TailStream
}
from 'action-stream'
import RenderStreamSample from './RenderStreamSample'

let stream = new RenderStreamSample(),
  tailStream = new TailStream(true)

stream
  .pipe(tailStream)

export default stream
```

If you set the first argument of the constructor to `true`, it output received actions by `console.log`.
You can see all the actions going through the stream.


## API document

https://doc.esdoc.org/github.com/ledsun/action-stream/

## For development
### Setup

```
npm install
```

### Build

```
npm start
```

### Test

```
npm test
```

### Update the API document

1. Open [ESDoc Hosting Service](https://doc.esdoc.org/-/generate.html)
1.  Input `git@github.com:ledsun/action-stream.git`
1. Push `Generate`
