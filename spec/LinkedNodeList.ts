import {LinkedValueNodeList} from '../src/LinkedNodeList';

describe('LinkedNodeList', () => {
	it('should add nodes as expected', () => {
		const list = new LinkedValueNodeList<string>();
		const cNode = {value: 'c'};
		list
			.addNode({value: 'b'})
			.addNodeBefore({value: 'a'}, list.first)
			.addNodeAfter({value: 'd'}, list.last)
			.addNodeBefore(cNode, list.last);

		let result: string = '';
		for(const e of list)
		{
			result += e.value;
		}
		// noinspection SpellCheckingInspection
		expect(result).toBe('abcd');
		expect(list.unsafeCount).toBe(4);
		expect(list.getCount()).toBe(4);

		result = '';
		for(const e of list.getValues())
		{
			result += e;
		}
		// noinspection SpellCheckingInspection
		expect(result).toBe('abcd');

		list.replace(cNode, {value: 'X'});
		result = '';
		for(const e of list.getValues())
		{
			result += e;
		}
		// noinspection SpellCheckingInspection
		expect(result).toBe('abXd');

		expect(() => {
			for(const e of list)
			{
				list.addNode({value: e.value});
			}
		}).toThrow(); // collection modified.

		list.clear();
		expect(list.unsafeCount).toBe(0);
	});
});
