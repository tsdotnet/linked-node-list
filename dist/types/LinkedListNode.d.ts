/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

export interface LinkedNode<TNode extends LinkedNode<TNode>>
{
	previous?: TNode | undefined;
	next?: TNode | undefined;
}

export type ProtectedLinkedNode<TNode extends LinkedNode<TNode>> =
	Omit<TNode, 'previous' | 'next'>
	& {
	readonly previous?: ProtectedLinkedNode<TNode> | undefined;
	readonly next?: ProtectedLinkedNode<TNode> | undefined;
};

export interface NodeWithValue<TValue>
{
	value: TValue;
}

export interface LinkedNodeWithValue<T>
	extends LinkedNode<LinkedNodeWithValue<T>>, NodeWithValue<T>
{

}
