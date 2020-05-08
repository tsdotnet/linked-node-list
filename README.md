# ![alt text](https://avatars1.githubusercontent.com/u/64487547?s=30&amp;v=5 "tsdotnet") tsdotnet / linked-node-list

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/linked-node-list/blob/master/LICENSE)
![npm-publish](https://github.com/tsdotnet/linked-node-list/workflows/npm-publish/badge.svg)
[![npm version](https://img.shields.io/npm/v/@tsdotnet/linked-node-list.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/linked-node-list)

An unprotected bi-directional linked list. Useful for implementing other collections or for managing custom nodes (links).

## Docs

[tsdotnet.github.io/linked-node-list](https://tsdotnet.github.io/linked-node-list/)

This class is useful for managing a list of linked nodes, but it does not protect against modifying individual links.
If the consumer modifies a link (sets the previous or next value) it will effectively break the collection.

It is possible to declare a node type of any kind as long as it contains a previous and next value that can reference another node.
Although not as safe as a protected [LinkedList](https://github.com/tsdotnet/linked-list/), this class has less overhead and is more flexible.

The count (or length) of this LinkedNodeList is tracked as '.unsafeCount' and calling '.getCount()' will iterate the list.

A perfect example of the use of LinkedNodeList is [LinkedList](https://github.com/tsdotnet/linked-list/) as it uses it for its internal collection.
