import { ArgumentNullException, ArgumentException, InvalidOperationException } from '@tsdotnet/exceptions';
import { IterableCollectionBase, ExtendedIterable } from '@tsdotnet/collection-base';

class LinkedNodeList extends IterableCollectionBase {
    _first;
    _last;
    _unsafeCount = 0;
    constructor() { super(); }
    get unsafeCount() {
        return this._unsafeCount;
    }
    get first() {
        return this._first;
    }
    get last() {
        return this._last;
    }
    clear() {
        let n = this._first;
        let cF = 0, cL = 0;
        this._first = undefined;
        while (n) {
            cF++;
            const current = n;
            n = n.next;
            current.next = undefined;
        }
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
        this.incrementVersion();
        this._unsafeCount = 0;
        return cF;
    }
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
            _.incrementVersion();
            _._unsafeCount--;
            node.previous = undefined;
            node.next = undefined;
        }
        return removed;
    }
    dispose() {
        this.clear();
    }
    recycle() {
        this.clear();
    }
    contains(node) {
        if (!node)
            throw new ArgumentNullException('node');
        return this.indexOf(node) != -1;
    }
    getNodeAt(index) {
        if (index < 0 || !isFinite(index))
            return undefined;
        let next = this._first;
        let i = 0;
        while (next && i++ < index) {
            next = next.next;
        }
        return next;
    }
    find(condition) {
        let i = 0;
        for (const e of this) {
            if (condition(e, i++))
                return e;
        }
        return undefined;
    }
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
        _.incrementVersion();
        _._unsafeCount++;
        return this;
    }
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
    removeFirst() {
        return !!this.takeFirst();
    }
    removeLast() {
        return !!this.takeLast();
    }
    addNode(node) {
        this.addNodeAfter(node);
        return this;
    }
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
        _.incrementVersion();
        _._unsafeCount++;
        return _;
    }
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
        _.incrementVersion();
        return _;
    }
    _reversed;
    get reversed() {
        const _ = this;
        return (_._reversed || (_._reversed = Object.freeze(ExtendedIterable.create({
            *[Symbol.iterator]() {
                let current, prev = _.last;
                while (prev) {
                    current = prev;
                    prev = current.previous;
                    yield current;
                }
            }
        }))));
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
class LinkedValueNodeList extends LinkedNodeList {
    prependValue(value) {
        this.addNodeBefore({ value: value });
        return this;
    }
    appendValue(value) {
        return this.addNode({ value: value });
    }
    *getValues() {
        for (const node of this) {
            yield node.value;
        }
    }
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

export { LinkedNodeList, LinkedValueNodeList };
//# sourceMappingURL=LinkedNodeList.js.map
