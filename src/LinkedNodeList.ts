/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import {ArrayLikeWritable, PredicateWithIndex} from '@tsdotnet/common-interfaces';
import {LinkedNode, LinkedNodeWithValue, NodeWithValue} from './LinkedListNode';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';

export {LinkedNode, LinkedNodeWithValue, NodeWithValue};
/* eslint-disable @typescript-eslint/no-this-alias */

/*****************************
 * IMPORTANT NOTES ABOUT PERFORMANCE:
 * http://jsperf.com/simulating-a-queue
 *
 * Adding to an array is very fast, but modifying is slow.
 * LinkedList wins when modifying contents.
 * http://stackoverflow.com/questions/166884/array-versus-linked-list
 *****************************/

/**
 * This class is useful for managing a list of linked nodes, but it does not protect against modifying individual links.
 * If the consumer modifies a link (sets the previous or next value) it will effectively break the collection.
 *
 * It is possible to declare a node type of any kind as long as it contains a previous and next value that can reference another node.
 * Although not as safe as the included LinkedList, this class has less overhead and is more flexible.
 *
 * The count (or length) of this LinkedNodeList is not tracked since it could be corrupted at any time.
 */
export default class LinkedNodeList<TNode extends LinkedNode<TNode>>
	implements Iterable<TNode>
{
	private _first: TNode | undefined;
	private _version: number;
	private _last: TNode | undefined;

	constructor ()
	{
		this._unsafeCount = 0;
		this._version = 0;
	}

	private _unsafeCount: number;

	/**
	 * Returns the tracked number of nodes in the list.
	 * Since a LinkedNodeList is unprotected, it is possible to modify the chain and this count could get out of sync.
	 * To know the actual number of nodes, call .getCount() to iterate over each node.
	 * @returns {number}
	 */
	get unsafeCount (): number
	{
		return this._unsafeCount;
	}

	/**
	 * The version number used to track changes.
	 * @returns {number}
	 */
	get version (): number
	{
		return this._version;
	}

	/**
	 * The first node.  Will be null if the collection is empty.
	 */
	get first (): TNode | undefined
	{
		return this._first;
	}

	/**
	 * The last node.
	 */
	get last (): TNode | undefined
	{
		return this._last;
	}

	/**
	 * Iteratively counts the number of linked nodes and returns the value.
	 * @returns {number}
	 */
	getCount (): number
	{

		let next = this._first;

		let i: number = 0;
		while(next)
		{
			i++;
			next = next.next;
		}

		return i;
	}

	static* valueIterableFrom<T> (list: LinkedNodeList<LinkedNodeWithValue<T>>): Iterable<T>
	{
		if(!list) throw new ArgumentNullException('list');

		for(const node of list)
		{
			yield node.value;
		}
	}

	static copyValues<T, TDestination extends ArrayLikeWritable<any>> (
		list: LinkedNodeList<LinkedNodeWithValue<T>>,
		array: TDestination,
		index: number = 0): TDestination
	{
		if(list && list.first)
		{
			if(!array) throw new ArgumentNullException('array');

			let i = 0;
			for(const value of LinkedNodeList.valueIterableFrom(list))
			{
				array[index + i++] = value;
			}
		}

		return array;
	}

	* [Symbol.iterator] (): Iterator<TNode>
	{
		const version = this._version;
		let current: TNode | undefined, next = this.first;

		while(next)
		{
			this.assertVersion(version);
			current = next;
			next = current.next;
			yield current;
		}
	}

	assertVersion (version: number): true | never
	{
		if(version!==this._version)
			throw new InvalidOperationException('Collection was modified.');
		return true;
	}

	/**
	 * Erases the linked node's references to each other and returns the number of nodes.
	 * @returns {number}
	 */
	clear (): number
	{
		let n = this._first;
		let cF: number = 0, cL: number = 0;

		// First, clear in the forward direction.
		this._first = undefined;

		while(n)
		{
			cF++;
			const current = n;
			n = n.next;
			current.next = undefined;
		}

		// Last, clear in the reverse direction.
		n = this._last;
		this._last = undefined;

		while(n)
		{
			cL++;
			const current = n;
			n = n.previous;
			current.previous = undefined;
		}

		if(cF!==cL) console.warn('LinkedNodeList: Forward versus reverse count does not match when clearing. Forward: ' + cF + ', Reverse: ' + cL);

		this._version++;
		this._unsafeCount = 0;

		return cF;
	}

	/**
	 * Clears the list.
	 */
	dispose (): void
	{
		this.clear();
	}

	/**
	 * Clears the list.
	 */
	recycle (): void
	{
		this.clear();
	}

	/**
	 * Iterates the list to see if a node exists.
	 * @param node
	 * @returns {boolean}
	 */
	contains (node: TNode): boolean
	{
		if(!node) throw new ArgumentNullException('node');
		return this.indexOf(node)!= -1;
	}

	/**
	 * Gets the index of a particular node.
	 * @param index
	 */
	getNodeAt (index: number): TNode | undefined
	{
		if(index<0)
			return undefined;

		let next = this._first;

		let i: number = 0;
		while(next && i++<index)
		{
			next = next.next;
		}

		return next;

	}

	find (condition: PredicateWithIndex<TNode>): TNode | undefined
	{
		let i = 0;
		for(const e of this)
		{
			if(condition(e, i++))
				return e;
		}
		return undefined;
	}

	/**
	 * Iterates the list to find the specified node and returns its index.
	 * @param node
	 * @returns {boolean}
	 */
	indexOf (node: TNode): number
	{
		if(node && (node.previous || node.next))
		{

			let index = 0;
			let c: TNode | undefined,
				n = this._first;

			do
			{
				c = n;
				if(c===node) return index;
				index++;
			}
			while((n = c && c.next));
		}

		return -1;
	}

	/**
	 * Removes the specified node.
	 * Returns true if successful and false if not found (already removed).
	 * @param node
	 * @returns {boolean}
	 */
	removeNode (node: TNode): boolean
	{
		if(!node) throw new ArgumentNullException('node');

		const
			_    = this,
			prev = node.previous,
			next = node.next;

		let a: boolean = false,
			b: boolean = false;

		if(prev) prev.next = next;
		else if(_._first==node) _._first = next;
		else a = true;

		if(next) next.previous = prev;
		else if(_._last==node) _._last = prev;
		else b = true;

		if(a!==b)
		{
			throw new ArgumentException(
				'node',
				`Provided node is has no ${
					a ? 'previous' : 'next'} reference but is not the ${
					a ? 'first' : 'last'} node!`);
		}

		const removed = !a && !b;
		if(removed)
		{
			_._version++;
			_._unsafeCount--;
			node.previous = undefined;
			node.next = undefined;
		}
		return removed;

	}

	/**
	 * Removes the first node and returns it if successful.
	 */
	takeFirst (): TNode | undefined
	{
		const node = this._first;
		if(!node) return undefined;
		if(node.previous)
			throw new Error('Collection is corrupted: first node has previous node.');
		if(!this.removeNode(node))
			throw new Error('Collection is corrupted: unable to remove first node.');
		return node;
	}

	/**
	 * Removes the last node and returns it if successful.
	 */
	takeLast (): TNode | undefined
	{
		const node = this._last;
		if(!node) return undefined;
		if(node.next)
			throw new Error('Collection is corrupted: last node has next node.');
		if(!this.removeNode(node))
			throw new Error('Collection is corrupted: unable to remove last node.');
		return node;
	}

	/**
	 * Removes the first node and returns true if successful.
	 * @returns {boolean}
	 */
	removeFirst (): boolean
	{
		return !!this.takeFirst();
	}

	/**
	 * Removes the last node and returns true if successful.
	 * @returns {boolean}
	 */
	removeLast (): boolean
	{
		return !!this.takeLast();
	}

	/**
	 * Adds a node to the end of the list.
	 * @param node
	 * @returns {LinkedNodeList}
	 */
	addNode (node: TNode): this
	{
		this.addNodeAfter(node);
		return this;
	}

	/**
	 * Inserts a node before the specified 'before' node.
	 * If no 'before' node is specified, it inserts it as the first node.
	 * @param node
	 * @param before
	 * @returns {LinkedNodeList}
	 */
	addNodeBefore (node: TNode, before?: TNode): this
	{
		assertValidDetached(node);

		const _ = this;

		if(!before)
		{
			before = _._first;
		}

		if(before)
		{
			const prev = before.previous;
			node.previous = prev;
			node.next = before;

			before.previous = node;
			if(prev) prev.next = node;
			if(before==_._first) _._first = node;
		}
		else
		{
			_._first = _._last = node;
		}

		_._version++;
		_._unsafeCount++;

		return this;
	}

	/**
	 * Inserts a node after the specified 'after' node.
	 * If no 'after' node is specified, it appends it as the last node.
	 * @param node
	 * @param after
	 * @returns {LinkedNodeList}
	 */
	addNodeAfter (node: TNode, after?: TNode): this
	{
		assertValidDetached(node);
		const _ = this;

		if(!after)
		{
			after = _._last;
		}

		if(after)
		{
			const next = after.next;
			node.next = next;
			node.previous = after;

			after.next = node;
			if(next) next.previous = node;
			if(after==_._last) _._last = node;
		}
		else
		{
			_._first = _._last = node;
		}

		_._version++;
		_._unsafeCount++;

		return _;
	}

	/**
	 * Takes and existing node and replaces it.
	 * @param node
	 * @param replacement
	 * @returns {any}
	 */
	replace (node: TNode, replacement: TNode): this
	{
		if(node==replacement) return this;

		assertValidDetached(replacement, 'replacement');

		const _ = this;
		replacement.previous = node.previous;
		replacement.next = node.next;

		if(node.previous) node.previous.next = replacement;
		if(node.next) node.next.previous = replacement;

		if(node==_._first) _._first = replacement;
		if(node==_._last) _._last = replacement;

		_._version++;

		return _;
	}

}

function assertValidDetached<TNode extends LinkedNode<TNode>> (
	node: TNode,
	propName: string = 'node'): void | never
{
	if(!node)
		throw new ArgumentNullException(propName);

	if(node.next || node.previous)
		throw new InvalidOperationException('Cannot add a node to a LinkedNodeList that is already linked.');

}
