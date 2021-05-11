# ![alt text](https://avatars1.githubusercontent.com/u/64487547?s=30 "tsdotnet") tsdotnet / linked-node-list

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/linked-node-list/blob/master/LICENSE)
![100% code coverage](https://img.shields.io/badge/coverage-100%25-green)
![npm-publish](https://github.com/tsdotnet/linked-node-list/workflows/npm-publish/badge.svg)
[![npm version](https://img.shields.io/npm/v/@tsdotnet/linked-node-list.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/linked-node-list)

An unprotected bi-directional linked list. Useful for implementing other collections or for managing custom nodes (links).

If you are looking for a protected and value focused linked list:
[github.com/tsdotnet/linked-list](https://github.com/tsdotnet/linked-list/)

## Docs

[tsdotnet.github.io/linked-node-list](https://tsdotnet.github.io/linked-node-list/classes/linkednodelist.linkednodelist-1.html)

This class is useful for managing a list of linked nodes, but it does not protect against modifying individual links.
If the consumer modifies a link (sets the previous or next value) it will effectively break the collection.

It is possible to declare a node type of any kind as long as it contains a previous and next value that can reference another node.
Although not as safe as a protected linked list, this class has less overhead and is more flexible.

The count (or length) of this `LinkedNodeList` is tracked as `.unsafeCount` and calling `.getCount()` will iterate the list.

A perfect example of the use of `LinkedNodeList` is with [`LinkedList`](https://github.com/tsdotnet/linked-list/) as it uses it for its internal collection.
