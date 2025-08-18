import type { ArrayLikeWritable, PredicateWithIndex } from '@tsdotnet/common-interfaces';
import type { LinkedNode, LinkedNodeWithValue, NodeWithValue, ProtectedLinkedNode } from './LinkedListNode';
import { IterableCollectionBase, ExtendedIterable } from '@tsdotnet/collection-base';
export { LinkedNode, LinkedNodeWithValue, NodeWithValue, ProtectedLinkedNode };
export declare class LinkedNodeList<TNode extends LinkedNode<TNode>> extends IterableCollectionBase<ProtectedLinkedNode<TNode>> {
    private _first;
    private _last;
    private _unsafeCount;
    constructor();
    get unsafeCount(): number;
    get first(): ProtectedLinkedNode<TNode> | undefined;
    get last(): ProtectedLinkedNode<TNode> | undefined;
    clear(): number;
    removeNode(node: TNode): boolean;
    dispose(): void;
    recycle(): void;
    contains(node: TNode): boolean;
    getNodeAt(index: number): ProtectedLinkedNode<TNode> | undefined;
    find(condition: PredicateWithIndex<ProtectedLinkedNode<TNode>>): ProtectedLinkedNode<TNode> | undefined;
    indexOf(node: TNode): number;
    addNodeBefore(node: TNode, before?: TNode): this;
    takeFirst(): TNode | undefined;
    takeLast(): TNode | undefined;
    removeFirst(): boolean;
    removeLast(): boolean;
    addNode(node: TNode): this;
    addNodeAfter(node: TNode, after?: TNode): this;
    replace(node: TNode, replacement: TNode): this;
    private _reversed?;
    get reversed(): ExtendedIterable<ProtectedLinkedNode<TNode>>;
    protected _getIterator(): Iterator<ProtectedLinkedNode<TNode>>;
}
export declare class LinkedValueNodeList<T> extends LinkedNodeList<LinkedNodeWithValue<T>> {
    prependValue(value: T): this;
    appendValue(value: T): this;
    getValues(): Iterable<T>;
    copyValuesTo<TDestination extends ArrayLikeWritable<any>>(array: TDestination, index?: number): TDestination;
}
