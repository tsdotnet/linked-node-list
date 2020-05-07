/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

export interface LinkedNode<TNode extends LinkedNode<TNode>>
{
	previous?: TNode;
	next?: TNode;
}

export interface NodeWithValue<TValue>
{
	value: TValue;
}

export interface LinkedNodeWithValue<T>
	extends LinkedNode<LinkedNodeWithValue<T>>, NodeWithValue<T>
{

}

