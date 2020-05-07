import { ArrayLikeWritable, PredicateWithIndex } from '@tsdotnet/common-interfaces';
import { LinkedNode, LinkedNodeWithValue, NodeWithValue } from './LinkedListNode';
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
 * Although not as safe as the included LinkedList, this class has less overhead and is more flexible.
 *
 * The count (or length) of this LinkedNodeList is not tracked since it could be corrupted at any time.
 */
export default class LinkedNodeList<TNode extends LinkedNode<TNode>> extends IterableCollectionBase<TNode> {
    private _first;
    private _last;
    private _unsafeCount;
    /**
     * Returns the tracked number of nodes in the list.
     * Since a LinkedNodeList is unprotected, it is possible to modify the chain and this count could get out of sync.
     * To know the actual number of nodes, call .getCount() to iterate over each node.
     * @returns {number}
     */
    get unsafeCount(): number;
    /**
     * The first node.  Will be null if the collection is empty.
     */
    get first(): TNode | undefined;
    /**
     * The last node.
     */
    get last(): TNode | undefined;
    static valueIterableFrom<T>(list: LinkedNodeList<LinkedNodeWithValue<T>>): Iterable<T>;
    static copyValues<T, TDestination extends ArrayLikeWritable<any>>(list: LinkedNodeList<LinkedNodeWithValue<T>>, array: TDestination, index?: number): TDestination;
    protected _getIterator(): Iterator<TNode>;
    /**
     * Erases the linked node's references to each other and returns the number of nodes.
     * @returns {number}
     */
    clear(): number;
    /**
     * Clears the list.
     */
    dispose(): void;
    /**
     * Clears the list.
     */
    recycle(): void;
    /**
     * Iterates the list to see if a node exists.
     * @param node
     * @returns {boolean}
     */
    contains(node: TNode): boolean;
    /**
     * Gets the index of a particular node.
     * @param index
     */
    getNodeAt(index: number): TNode | undefined;
    find(condition: PredicateWithIndex<TNode>): TNode | undefined;
    /**
     * Iterates the list to find the specified node and returns its index.
     * @param node
     * @returns {boolean}
     */
    indexOf(node: TNode): number;
    /**
     * Removes the specified node.
     * Returns true if successful and false if not found (already removed).
     * @param node
     * @returns {boolean}
     */
    removeNode(node: TNode): boolean;
    /**
     * Removes the first node and returns it if successful.
     */
    takeFirst(): TNode | undefined;
    /**
     * Removes the last node and returns it if successful.
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
     * Inserts a node before the specified 'before' node.
     * If no 'before' node is specified, it inserts it as the first node.
     * @param node
     * @param before
     * @returns {LinkedNodeList}
     */
    addNodeBefore(node: TNode, before?: TNode): this;
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
}
