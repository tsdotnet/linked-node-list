/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import {ArrayLikeWritable, PredicateWithIndex} from '@tsdotnet/common-interfaces';
import {
	LinkedNode,
	LinkedNodeWithValue,
	NodeWithValue,
	ProtectedLinkedNode
} from './LinkedListNode';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import IterableCollectionBase from '@tsdotnet/collection-base/dist/IterableCollectionBase';
import {ExtendedIterable} from '@tsdotnet/collection-base';

export {LinkedNode, LinkedNodeWithValue, NodeWithValue, ProtectedLinkedNode};
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
 * Although not as safe as a protected LinkedList, this class has less overhead and is more flexible.
 *
 * The count (or length) of this `LinkedNodeList` is tracked as `.unsafeCount` and calling `.getCount()` will iterate the list.
 *
 * @template TNode The node type.
 */
export class LinkedNodeList<TNode extends LinkedNode<TNode>>
	extends IterableCollectionBase<ProtectedLinkedNode<TNode>>
{
	private _first: TNode | undefined;
	private _last: TNode | undefined;
	private _unsafeCount: number = 0;

	constructor () {super();}

	/**
	 * Returns the tracked number of nodes in the list.
	 * Since a `LinkedNodeList` is unprotected, it is possible to modify the chain and this count could get out of sync.
	 * To know the actual number of nodes, call `.getCount()` to iterate over each node.
	 * @returns {number}
	 */
	get unsafeCount (): number
	{
		return this._unsafeCount;
	}

	/**
	 * Returns the first node or undefined if the collection is empty.
	 * @return The first node or undefined.
	 */
	get first (): ProtectedLinkedNode<TNode> | undefined
	{
		return this._first;
	}

	/**
	 * Returns last node or be undefined if the collection is empty.
	 * @return The last node or undefined.
	 */
	get last (): ProtectedLinkedNode<TNode> | undefined
	{
		return this._last;
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

		this.incrementVersion();
		this._unsafeCount = 0;

		return cF;
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
			_.incrementVersion();
			_._unsafeCount--;
			node.previous = undefined;
			node.next = undefined;
		}
		return removed;

	}

	/**
	 * Clears the list.
	 * Provided for use with dispose helpers.
	 */
	dispose (): void
	{
		this.clear();
	}

	/**
	 * Clears the list.
	 * Provided for use with object pools.
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
	 * Iterates the list returns the node at the index requested.
	 * Returns undefined if the index is out of range.
	 * @param index
	 * @returns The node at the index requested or undefined.
	 */
	getNodeAt (index: number): ProtectedLinkedNode<TNode> | undefined
	{
		if(index<0 || !isFinite(index))
			return undefined;

		let next = this._first;

		let i: number = 0;
		while(next && i++<index)
		{
			next = next.next;
		}

		return next;

	}

	/**
	 * Iterates the list to find the specific node that matches the predicate condition.
	 * @param {PredicateWithIndex} condition
	 * @returns The found node or undefined.
	 */
	find (condition: PredicateWithIndex<ProtectedLinkedNode<TNode>>): ProtectedLinkedNode<TNode> | undefined
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

		_.incrementVersion();
		_._unsafeCount++;

		return this;
	}

	/**
	 * Removes the first node and returns it if successful.
	 * Returns undefined if the collection is empty.
	 * @return The node that was removed, or undefined if the collection is empty.
	 */
	takeFirst (): TNode | undefined
	{
		const node = this._first;
		if(!node) return undefined;
		if(node.previous) throw new Error('Collection is corrupted: first node has previous node.');
		if(!this.removeNode(node)) throw new Error('Collection is corrupted: unable to remove first node.');
		return node;
	}

	/**
	 * Removes the last node and returns it if successful.
	 * Returns undefined if the collection is empty.
	 * @return The node that was removed, or undefined if the collection is empty.
	 */
	takeLast (): TNode | undefined
	{
		const node = this._last;
		if(!node) return undefined;
		if(node.next) throw new Error('Collection is corrupted: last node has next node.');
		if(!this.removeNode(node)) throw new Error('Collection is corrupted: unable to remove last node.');
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

		_.incrementVersion();
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

		_.incrementVersion();

		return _;
	}

	private _reversed?: Readonly<ExtendedIterable<ProtectedLinkedNode<TNode>>>;
	/**
	 * Iterable for iterating this collection in reverse order.
	 * @return {Iterable<ProtectedLinkedNode>}
	 */
	get reversed (): ExtendedIterable<ProtectedLinkedNode<TNode>>
	{
		const _ = this;
		return (_._reversed || (_._reversed = Object.freeze(ExtendedIterable.create({
			* [Symbol.iterator] (): Iterator<ProtectedLinkedNode<TNode>>
			{
				let current: ProtectedLinkedNode<TNode> | undefined, prev = _.last;
				while(prev)
				{
					current = prev;
					prev = current.previous;
					yield current;
				}
			}
		})))) as ExtendedIterable<ProtectedLinkedNode<TNode>>;
	}

	protected* _getIterator (): Iterator<ProtectedLinkedNode<TNode>>
	{
		let current: ProtectedLinkedNode<TNode> | undefined, next = this.first;
		while(next)
		{
			current = next;
			next = current.next;
			yield current;
		}
	}

}

/**
 * This class covers most LinkedNodeList use cases by assuming the node type includes a '.value' property.
 */
export class LinkedValueNodeList<T>
	extends LinkedNodeList<LinkedNodeWithValue<T>>
{

	/**
	 * Adds a node with the given value to the start of the list.
	 * Becomes the first node.
	 * @param value
	 * @return {this}
	 */
	prependValue (value: T): this
	{
		this.addNodeBefore({value: value});
		return this;
	}

	/**
	 * Adds a node with the given value to the end of the list.
	 * Becomes the last node.
	 * @param value
	 * @return {this}
	 */
	appendValue (value: T): this
	{
		return this.addNode({value: value});
	}

	/**
	 * Returns an iterable that selects the value of each node.
	 * @returns {Iterable}
	 */
	* getValues (): Iterable<T>
	{
		for(const node of this)
		{
			yield node.value;
		}
	}

	/**
	 * Copies the values of each node to an array (or array-like object).
	 * @param {TDestination} array The target array.
	 * @param {number} index The starting index of the target array.
	 * @returns {TDestination} The target array.
	 */
	copyValuesTo<TDestination extends ArrayLikeWritable<any>> (
		array: TDestination,
		index: number = 0): TDestination
	{
		if(!array) throw new ArgumentNullException('array');

		let i = 0;
		for(const node of this)
		{
			array[index + i++] = node.value;
		}

		return array;
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
