/* eslint-disable @typescript-eslint/no-unused-vars */
import {expect} from 'chai';
import {LinkedValueNodeList, NodeWithValue} from '../src/LinkedNodeList';

describe('LinkedNodeList', () => {
	it('should add nodes as expected', () => {
		const list = new LinkedValueNodeList<string>();
		const cNode = {value: 'c'};
		list
			.addNodeBefore({value: 'b'})
			.addNodeBefore({value: 'a'}, list.first)
			.addNodeAfter({value: 'd'}, list.last)
			.addNodeBefore(cNode, list.last);

		//@ts-expect-error
		expect(() => list.addNode(null)).to.throw();
		expect(() => list.addNode({value: 'x', previous: cNode})).to.throw();
		expect(() => list.addNode({value: 'x', next: cNode})).to.throw();

		let result: string = '';
		for(const e of list)
		{
			result += e.value;
		}
		// noinspection SpellCheckingInspection
		expect(result).equal('abcd');
		expect(list.unsafeCount).equal(4);
		expect(list.getCount()).equal(4);

		result = '';
		for(const e of list.getValues())
		{
			result += e;
		}
		// noinspection SpellCheckingInspection
		expect(result).equal('abcd');

		list.replace(cNode, {value: 'X'});
		result = '';
		for(const e of list.getValues())
		{
			result += e;
		}
		// noinspection SpellCheckingInspection
		expect(result).equal('abXd');

		expect(() => {
			for(const e of list)
			{
				list.addNode({value: e.value});
			}
		}).to.throw(); // collection modified.

		list.clear();
		expect(list.unsafeCount).equal(0);
	});

	describe('.contains(node)', () => {
		const list = new LinkedValueNodeList<string>();
		const first = {value: 'a'};
		const last = {value: 'b'};
		list.addNode(first).addNode(last);

		it('should throw if node is null', () => {
			//@ts-expect-error
			expect(() => list.contains(null)).to.throw();
		});

		it('should only find nodes it has', () => {
			expect(list.contains(first)).to.be.true;
			expect(list.contains(last)).to.be.true;
			expect(list.contains({value: 'c'})).to.be.false;
		});
	});

	describe('.getNodeAt(index)', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);
		// Ensure value si not readonly.
		list.first!.value = list.first!.value;
		// @ts-expect-error Ensure read-only is working.
		// noinspection JSConstantReassignment
		list.first!.next = list.first!.next;
		// @ts-expect-error Ensure read-only is working.
		// noinspection JSConstantReassignment
		list.first!.previous = list.first!.previous;

		it('should return undefined if out of bounds', () => {
			expect(list.getNodeAt(-1)).to.be.undefined;
			expect(list.getNodeAt(NaN)).to.be.undefined;
			expect(list.getNodeAt(Infinity)).to.be.undefined;
		});

		it('return expected nodes', () => {
			for(let i = 0; i<list.unsafeCount; i++)
			{
				expect(list.getNodeAt(i)!.value).equal(i);
			}
		});
	});

	describe('.copyValuesTo(array, index)', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);
		let target = [-1];
		list.copyValuesTo(target, 1);
		expect(target).to.have.ordered.members([-1, 0, 1, 2]);
		target = [-1];
		list.copyValuesTo(target);
		expect(target).to.have.ordered.members([0, 1, 2]);
	});

	describe('.clear()', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);
		expect(list.clear()).equal(3);
		expect(list.unsafeCount).equal(0);
		expect(list.getCount()).equal(0);
	});

	describe('.dispose()', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);
		list.dispose();
		expect(list.unsafeCount).equal(0);
		expect(list.getCount()).equal(0);
	});

	describe('.recycle()', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);
		list.recycle();
		expect(list.unsafeCount).equal(0);
		expect(list.getCount()).equal(0);
	});

	describe('.find(condition)', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);

		it('should return undefined for not found', () => {
			// noinspection JSUnusedLocalSymbols
			expect(list.find(n => false)).to.be.undefined;
		});

		it('return expected nodes', () => {
			expect(list.find(n => n.value==1)!.value).equal(1);
		});
	});

	describe('.removeFirst()', () => {
		it('should retrieve first value in list', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.removeFirst()).to.be.true;
			expect(list.last!.value).equal('b');
			expect(list.removeFirst()).to.be.true;
			expect(list.removeFirst()).to.be.false;
		});
	});

	describe('.takeFirst()', () => {
		it('should retrieve first value in list and undefined if none left', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.takeFirst()!.value).equal('a');
			expect(list.takeFirst()!.value).equal('b');
			expect(list.takeFirst()).to.be.undefined;
		});

		it('should throw if node is corrupted', () => {
			const list = new LinkedValueNodeList<string>();
			const first = {value: 'a'};
			list.addNode(first).addNode({value: 'b'});
			// @ts-ignore
			first.previous = {value: 'c'};
			expect(() => list.takeFirst()).to.throw();
		});

		it('should throw if unable to be removed', () => {
			const list = new LinkedValueNodeList<string>();
			const first = {value: 'a'};
			list.addNode(first).addNode({value: 'b'});
			// @ts-ignore
			first.next = undefined;
			expect(() => list.takeFirst()).to.throw();
		});
	});

	describe('.removeLast()', () => {
		it('should retrieve first value in list', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.removeLast()).to.be.true;
			expect(list.first!.value).equal('a');
			expect(list.removeLast()).to.be.true;
			expect(list.removeLast()).to.be.false;
		});
	});

	describe('.takeLast()', () => {
		it('should retrieve first value in list and undefined if none left', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.takeLast()!.value).equal('b');
			expect(list.takeLast()!.value).equal('a');
			expect(list.takeLast()).to.be.undefined;
		});

		it('should throw if node is corrupted', () => {
			const list = new LinkedValueNodeList<string>();
			const last = {value: 'b'};
			list.addNode({value: 'a'}).addNode(last);
			// @ts-ignore
			last.next = {value: 'c'};
			expect(() => list.takeLast()).to.throw();
		});

		it('should throw if unable to be removed', () => {
			const list = new LinkedValueNodeList<string>();
			const last = {value: 'b'};
			list.addNode({value: 'a'}).addNode(last);
			// @ts-ignore
			last.previous = undefined;
			expect(() => list.takeLast()).to.throw();
		});
	});

	describe('.removeNode(node)', () => {
		it('should throw if node is null', () => {
			const list = new LinkedValueNodeList<string>();
			//@ts-expect-error
			expect(() => list.removeNode(null)).to.throw();
		});
	});

	describe('.reversed', () => {
		it('should iterate in reverse', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			const a: NodeWithValue<string>[] = [];
			for(const n of list.reversed)
			{
				a.push(n);
			}
			expect(a[0].value).equal('b');
			expect(a[1].value).equal('a');
		});
	});
});
