/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import IterableCollectionBase from '@tsdotnet/collection-base/dist/IterableCollectionBase';
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
 * The count (or length) of this LinkedNodeList is tracked as '.unsafeCount' and calling '.getCount()' will iterate the list.
 *
 * @template TNode The node type.
 */
export class LinkedNodeList extends IterableCollectionBase {
    constructor() {
        super(...arguments);
        this._unsafeCount = 0;
    }
    /**
     * Returns the tracked number of nodes in the list.
     * Since a LinkedNodeList is unprotected, it is possible to modify the chain and this count could get out of sync.
     * To know the actual number of nodes, call .getCount() to iterate over each node.
     * @returns {number}
     */
    get unsafeCount() {
        return this._unsafeCount;
    }
    /**
     * Returns the first node or undefined if the collection is empty.
     * @return The first node or undefined.
     */
    get first() {
        return this._first;
    }
    /**
     * Returns last node or be undefined if the collection is empty.
     * @return The last node or undefined.
     */
    get last() {
        return this._last;
    }
    /**
     * Erases the linked node's references to each other and returns the number of nodes.
     * @returns {number}
     */
    clear() {
        let n = this._first;
        let cF = 0, cL = 0;
        // First, clear in the forward direction.
        this._first = undefined;
        while (n) {
            cF++;
            const current = n;
            n = n.next;
            current.next = undefined;
        }
        // Last, clear in the reverse direction.
        n = this._last;
        this._last = undefined;
        while (n) {
            cL++;
            const current = n;
            n = n.previous;
            current.previous = undefined;
        }
        if (cF !== cL)
            console.warn('LinkedNodeList: Forward versus reverse count does not match when clearing. Forward: ' + cF + ', Reverse: ' + cL);
        this._incrementVersion();
        this._unsafeCount = 0;
        return cF;
    }
    /**
     * Removes the specified node.
     * Returns true if successful and false if not found (already removed).
     * @param node
     * @returns {boolean}
     */
    removeNode(node) {
        if (!node)
            throw new ArgumentNullException('node');
        const _ = this, prev = node.previous, next = node.next;
        let a = false, b = false;
        if (prev)
            prev.next = next;
        else if (_._first == node)
            _._first = next;
        else
            a = true;
        if (next)
            next.previous = prev;
        else if (_._last == node)
            _._last = prev;
        else
            b = true;
        if (a !== b) {
            throw new ArgumentException('node', `Provided node is has no ${a ? 'previous' : 'next'} reference but is not the ${a ? 'first' : 'last'} node!`);
        }
        const removed = !a && !b;
        if (removed) {
            _._incrementVersion();
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
    dispose() {
        this.clear();
    }
    /**
     * Clears the list.
     * Provided for use with object pools.
     */
    recycle() {
        this.clear();
    }
    /**
     * Iterates the list to see if a node exists.
     * @param node
     * @returns {boolean}
     */
    contains(node) {
        if (!node)
            throw new ArgumentNullException('node');
        return this.indexOf(node) != -1;
    }
    /**
     * Gets the index of a particular node.
     * @param index
     * @returns The node requested or undefined.
     */
    getNodeAt(index) {
        if (index < 0)
            return undefined;
        let next = this._first;
        let i = 0;
        while (next && i++ < index) {
            next = next.next;
        }
        return next;
    }
    /**
     * Iterates the list to find the specific node that matches the predicate condition.
     * @param {PredicateWithIndex} condition
     * @returns The found node or undefined.
     */
    find(condition) {
        let i = 0;
        for (const e of this) {
            if (condition(e, i++))
                return e;
        }
        return undefined;
    }
    /**
     * Iterates the list to find the specified node and returns its index.
     * @param node
     * @returns {boolean}
     */
    indexOf(node) {
        if (node && (node.previous || node.next)) {
            let index = 0;
            let c, n = this._first;
            do {
                c = n;
                if (c === node)
                    return index;
                index++;
            } while ((n = c && c.next));
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
    addNodeBefore(node, before) {
        assertValidDetached(node);
        const _ = this;
        if (!before) {
            before = _._first;
        }
        if (before) {
            const prev = before.previous;
            node.previous = prev;
            node.next = before;
            before.previous = node;
            if (prev)
                prev.next = node;
            if (before == _._first)
                _._first = node;
        }
        else {
            _._first = _._last = node;
        }
        _._incrementVersion();
        _._unsafeCount++;
        return this;
    }
    /**
     * Removes the first node and returns it if successful.
     * Returns undefined if the collection is empty.
     * @return The node that was removed, or undefined if the collection is empty.
     */
    takeFirst() {
        const node = this._first;
        if (!node)
            return undefined;
        if (node.previous)
            throw new Error('Collection is corrupted: first node has previous node.');
        if (!this.removeNode(node))
            throw new Error('Collection is corrupted: unable to remove first node.');
        return node;
    }
    /**
     * Removes the last node and returns it if successful.
     * Returns undefined if the collection is empty.
     * @return The node that was removed, or undefined if the collection is empty.
     */
    takeLast() {
        const node = this._last;
        if (!node)
            return undefined;
        if (node.next)
            throw new Error('Collection is corrupted: last node has next node.');
        if (!this.removeNode(node))
            throw new Error('Collection is corrupted: unable to remove last node.');
        return node;
    }
    /**
     * Removes the first node and returns true if successful.
     * @returns {boolean}
     */
    removeFirst() {
        return !!this.takeFirst();
    }
    /**
     * Removes the last node and returns true if successful.
     * @returns {boolean}
     */
    removeLast() {
        return !!this.takeLast();
    }
    /**
     * Adds a node to the end of the list.
     * @param node
     * @returns {LinkedNodeList}
     */
    addNode(node) {
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
    addNodeAfter(node, after) {
        assertValidDetached(node);
        const _ = this;
        if (!after) {
            after = _._last;
        }
        if (after) {
            const next = after.next;
            node.next = next;
            node.previous = after;
            after.next = node;
            if (next)
                next.previous = node;
            if (after == _._last)
                _._last = node;
        }
        else {
            _._first = _._last = node;
        }
        _._incrementVersion();
        _._unsafeCount++;
        return _;
    }
    /**
     * Takes and existing node and replaces it.
     * @param node
     * @param replacement
     * @returns {any}
     */
    replace(node, replacement) {
        if (node == replacement)
            return this;
        assertValidDetached(replacement, 'replacement');
        const _ = this;
        replacement.previous = node.previous;
        replacement.next = node.next;
        if (node.previous)
            node.previous.next = replacement;
        if (node.next)
            node.next.previous = replacement;
        if (node == _._first)
            _._first = replacement;
        if (node == _._last)
            _._last = replacement;
        _._incrementVersion();
        return _;
    }
    *_getIterator() {
        let current, next = this.first;
        while (next) {
            current = next;
            next = current.next;
            yield current;
        }
    }
}
/**
 * This class covers most LinkedNodeList use cases by assuming the node type includes a '.value' property.
 */
export class LinkedValueNodeList extends LinkedNodeList {
    /**
     * Returns an iterable that selects the value of each node.
     * @returns {Iterable}
     */
    *getValues() {
        for (const node of this) {
            yield node.value;
        }
    }
    /**
     * Copies the values of each node to an array (or array-like object).
     * @param {TDestination} array The target array.
     * @param {number} index The starting index of the target array.
     * @returns {TDestination} The target array.
     */
    copyValuesTo(array, index = 0) {
        if (!array)
            throw new ArgumentNullException('array');
        let i = 0;
        for (const node of this) {
            array[index + i++] = node.value;
        }
        return array;
    }
}
function assertValidDetached(node, propName = 'node') {
    if (!node)
        throw new ArgumentNullException(propName);
    if (node.next || node.previous)
        throw new InvalidOperationException('Cannot add a node to a LinkedNodeList that is already linked.');
}
//# sourceMappingURL=LinkedNodeList.js.map