# action-stream
Model-View-Streamアーキテクチャー実現のためのライブラリです。

## うれしさ
Node.js Stream APIベースのUni-direction data flowアーキテクチャーを実現できます。
記述は面倒になりますが、プレゼンテーションロジックを分割したモジュールに共通のAPIを与えられます。

## 使い方
### インストール
`npm install action-stream`

### ActionReadable
Viewのイベントをアクションに変換する際に使います。

例：

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

### FunnelStream
複数のViewからのアクションを一つのStreamにまとめるために使います。

例：
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

コンストラクタの第一引数を`true`にすると、通過するアクションをdebug
出力します。

### ActionTransform
受診したアクションに応じてModelの操作、Viewの操作を行うために使います。

例1 Model：

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

例2 Render：

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


### TailStream
Steramを終端します。

例：
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

コンストラクタの第一引数を`true`にすると、受診するアクションをdebug
出力します。

## API

https://doc.esdoc.org/github.com/ledsun/action-stream/

## 開発方法
### 準備

```
npm install
```

### ビルド

```
npm start
```

### テスト

```
npm test
```

### ドキュメント更新

1. [ESDoc Hosting Service](https://doc.esdoc.org/-/generate.html) を開く
1. `git@github.com:ledsun/action-stream.git` を入力
1. `Generate` を押下
