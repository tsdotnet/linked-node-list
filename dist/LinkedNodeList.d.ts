import { ArrayLikeWritable, PredicateWithIndex } from '@tsdotnet/common-interfaces';
import { LinkedNode, LinkedNodeWithValue, NodeWithValue, ProtectedLinkedNode } from './LinkedListNode';
import IterableCollectionBase from '@tsdotnet/collection-base/dist/IterableCollectionBase';
export { LinkedNode, LinkedNodeWithValue, NodeWithValue };
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
export declare class LinkedNodeList<TNode extends LinkedNode<TNode>> extends IterableCollectionBase<ProtectedLinkedNode<TNode>> {
    private _first;
    private _last;
    private _unsafeCount;
    constructor();
    /**
     * Returns the tracked number of nodes in the list.
     * Since a `LinkedNodeList` is unprotected, it is possible to modify the chain and this count could get out of sync.
     * To know the actual number of nodes, call `.getCount()` to iterate over each node.
     * @returns {number}
     */
    get unsafeCount(): number;
    /**
     * Returns the first node or undefined if the collection is empty.
     * @return The first node or undefined.
     */
    get first(): ProtectedLinkedNode<TNode> | undefined;
    /**
     * Returns last node or be undefined if the collection is empty.
     * @return The last node or undefined.
     */
    get last(): ProtectedLinkedNode<TNode> | undefined;
    /**
     * Erases the linked node's references to each other and returns the number of nodes.
     * @returns {number}
     */
    clear(): number;
    /**
     * Removes the specified node.
     * Returns true if successful and false if not found (already removed).
     * @param node
     * @returns {boolean}
     */
    removeNode(node: TNode): boolean;
    /**
     * Clears the list.
     * Provided for use with dispose helpers.
     */
    dispose(): void;
    /**
     * Clears the list.
     * Provided for use with object pools.
     */
    recycle(): void;
    /**
     * Iterates the list to see if a node exists.
     * @param node
     * @returns {boolean}
     */
    contains(node: TNode): boolean;
    /**
     * Iterates the list returns the node at the index requested.
     * Returns undefined if the index is out of range.
     * @param index
     * @returns The node at the index requested or undefined.
     */
    getNodeAt(index: number): ProtectedLinkedNode<TNode> | undefined;
    /**
     * Iterates the list to find the specific node that matches the predicate condition.
     * @param {PredicateWithIndex} condition
     * @returns The found node or undefined.
     */
    find(condition: PredicateWithIndex<ProtectedLinkedNode<TNode>>): ProtectedLinkedNode<TNode> | undefined;
    /**
     * Iterates the list to find the specified node and returns its index.
     * @param node
     * @returns {boolean}
     */
    indexOf(node: TNode): number;
    /**
     * Inserts a node before the specified 'before' node.
     * If no 'before' node is specified, it inserts it as the first node.
     * @param node
     * @param before
     * @returns {LinkedNodeList}
     */
    addNodeBefore(node: TNode, before?: TNode): this;
    /**
     * Removes the first node and returns it if successful.
     * Returns undefined if the collection is empty.
     * @return The node that was removed, or undefined if the collection is empty.
     */
    takeFirst(): TNode | undefined;
    /**
     * Removes the last node and returns it if successful.
     * Returns undefined if the collection is empty.
     * @return The node that was removed, or undefined if the collection is empty.
     */
    takeLast(): TNode | undefined;
    /**
     * Removes the first node and returns true if successful.
     * @returns {boolean}
     */
    removeFirst(): boolean;
    /**
     * Removes the last node and returns true if successful.
     * @returns {boolean}
     */
    removeLast(): boolean;
    /**
     * Adds a node to the end of the list.
     * @param node
     * @returns {LinkedNodeList}
     */
    addNode(node: TNode): this;
    /**
     * Inserts a node after the specified 'after' node.
     * If no 'after' node is specified, it appends it as the last node.
     * @param node
     * @param after
     * @returns {LinkedNodeList}
     */
    addNodeAfter(node: TNode, after?: TNode): this;
    /**
     * Takes and existing node and replaces it.
     * @param node
     * @param replacement
     * @returns {any}
     */
    replace(node: TNode, replacement: TNode): this;
    private _reversed?;
    /**
     * Iterable for iterating this collection in reverse order.
     * @return {Iterable<ProtectedLinkedNode>}
     */
    get reversed(): Readonly<Iterable<ProtectedLinkedNode<TNode>>>;
    protected _getIterator(): Iterator<ProtectedLinkedNode<TNode>>;
}
/**
 * This class covers most LinkedNodeList use cases by assuming the node type includes a '.value' property.
 */
export declare class LinkedValueNodeList<T> extends LinkedNodeList<LinkedNodeWithValue<T>> {
    /**
     * Adds a node with the given value to the start of the list.
     * Becomes the first node.
     * @param value
     * @return {this}
     */
    prependValue(value: T): this;
    /**
     * Adds a node with the given value to the end of the list.
     * Becomes the last node.
     * @param value
     * @return {this}
     */
    appendValue(value: T): this;
    /**
     * Returns an iterable that selects the value of each node.
     * @returns {Iterable}
     */
    getValues(): Iterable<T>;
    /**
     * Copies the values of each node to an array (or array-like object).
     * @param {TDestination} array The target array.
     * @param {number} index The starting index of the target array.
     * @returns {TDestination} The target array.
     */
    copyValuesTo<TDestination extends ArrayLikeWritable<any>>(array: TDestination, index?: number): TDestination;
}
