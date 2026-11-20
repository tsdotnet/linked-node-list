<a name="banner"><img src="https://cdn.jsdelivr.net/gh/tsdotnet/linked-node-list@master/assets/banner.svg" alt="@tsdotnet/linked-node-list: The nodes are the list. Intrusive linked list, no wrappers."></a>

[![npm version](https://img.shields.io/npm/v/@tsdotnet/linked-node-list.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/linked-node-list)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/linked-node-list/blob/master/LICENSE)

An intrusive linked list where your own objects carry the next and previous links, with no wrapper nodes.

## Install

```sh
npm install @tsdotnet/linked-node-list
```

## Usage

```ts
import { LinkedNodeList, type LinkedNode } from '@tsdotnet/linked-node-list';

interface Job extends LinkedNode<Job> { name: string }

const jobs = new LinkedNodeList<Job>();
jobs.addNode({ name: 'build' }).addNode({ name: 'test' });

jobs.first?.name; // 'build'
jobs.takeFirst()?.name; // 'build'
```

Your objects hold `next` and `previous` themselves, so no wrapper is allocated. For a ready made node with a `value`, use `LinkedValueNodeList`.

## Use it from

ESM (`import { LinkedNodeList } from '@tsdotnet/linked-node-list';`) or CommonJS (`const { LinkedNodeList } = require('@tsdotnet/linked-node-list');`).

<details><summary>In a browser, without a bundler</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/type@1/dist/umd/type.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/compare@1/dist/umd/compare.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/exceptions@1/dist/umd/exceptions.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/collection-base@2/dist/umd/collection-base.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/linked-node-list@1/dist/umd/linked-node-list.min.js"></script>
<script>
  const { LinkedNodeList } = tsdotnet.linkedNodeList;
</script>
```

</details>

## Docs

[tsdotnet.github.io/linked-node-list](https://tsdotnet.github.io/linked-node-list/)
