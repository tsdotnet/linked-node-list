/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';
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
		expect(() => list.addNode(null)).toThrow();
		expect(() => list.addNode({value: 'x', previous: cNode})).toThrow();
		expect(() => list.addNode({value: 'x', next: cNode})).toThrow();

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
		}).toThrow(); // collection modified.

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
			expect(() => list.contains(null)).toThrow();
		});

		it('should only find nodes it has', () => {
			expect(list.contains(first)).toBe(true);
			expect(list.contains(last)).toBe(true);
			expect(list.contains({value: 'c'})).toBe(false);
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
			expect(list.getNodeAt(-1)).toBeUndefined();
			expect(list.getNodeAt(NaN)).toBeUndefined();
			expect(list.getNodeAt(Infinity)).toBeUndefined();
		});

		it('return expected nodes', () => {
			for(let i = 0; i<list.unsafeCount; i++)
			{
				expect(list.getNodeAt(i)!.value).equal(i);
			}
		});
	});

	describe('.copyValuesTo(array, index)', () => {
		it('should copy values to target array at specified index', () => {
			const list = new LinkedValueNodeList<number>();
			list.appendValue(1).appendValue(2).prependValue(0);
			let target = [-1];
			list.copyValuesTo(target, 1);
			expect(target).to.have.ordered.members([-1, 0, 1, 2]);
		});

		it('should copy values to target array at start when no index specified', () => {
			const list = new LinkedValueNodeList<number>();
			list.appendValue(1).appendValue(2).prependValue(0);
			const target = [-1];
			list.copyValuesTo(target);
			expect(target).to.have.ordered.members([0, 1, 2]);
		});
	});

	describe('.clear()', () => {
		it('should clear all values and return count', () => {
			const list = new LinkedValueNodeList<number>();
			list.appendValue(1).appendValue(2).prependValue(0);
			expect(list.clear()).equal(3);
			expect(list.unsafeCount).equal(0);
			expect(list.getCount()).equal(0);
		});
	});

	describe('.dispose()', () => {
		it('should dispose list and clear all values', () => {
			const list = new LinkedValueNodeList<number>();
			list.appendValue(1).appendValue(2).prependValue(0);
			list.dispose();
			expect(list.unsafeCount).equal(0);
			expect(list.getCount()).equal(0);
		});
	});

	describe('.recycle()', () => {
		it('should recycle list and clear all values', () => {
			const list = new LinkedValueNodeList<number>();
			list.appendValue(1).appendValue(2).prependValue(0);
			list.recycle();
			expect(list.unsafeCount).equal(0);
			expect(list.getCount()).equal(0);
		});
	});

	describe('.find(condition)', () => {
		const list = new LinkedValueNodeList<number>();
		list.appendValue(1).appendValue(2).prependValue(0);

		it('should return undefined for not found', () => {
			// noinspection JSUnusedLocalSymbols
			expect(list.find(n => false)).toBeUndefined();
		});

		it('return expected nodes', () => {
			expect(list.find(n => n.value==1)!.value).equal(1);
		});
	});

	describe('.removeFirst()', () => {
		it('should retrieve first value in list', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.removeFirst()).toBe(true);
			expect(list.last!.value).equal('b');
			expect(list.removeFirst()).toBe(true);
			expect(list.removeFirst()).toBe(false);
		});
	});

	describe('.takeFirst()', () => {
		it('should retrieve first value in list and undefined if none left', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.takeFirst()!.value).equal('a');
			expect(list.takeFirst()!.value).equal('b');
			expect(list.takeFirst()).toBeUndefined();
		});

		it('should throw if node is corrupted', () => {
			const list = new LinkedValueNodeList<string>();
			const first = {value: 'a'};
			list.addNode(first).addNode({value: 'b'});
			// @ts-ignore
			first.previous = {value: 'c'};
			expect(() => list.takeFirst()).toThrow();
		});

		it('should throw if unable to be removed', () => {
			const list = new LinkedValueNodeList<string>();
			const first = {value: 'a'};
			list.addNode(first).addNode({value: 'b'});
			// @ts-ignore
			first.next = undefined;
			expect(() => list.takeFirst()).toThrow();
		});
	});

	describe('.removeLast()', () => {
		it('should retrieve first value in list', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.removeLast()).toBe(true);
			expect(list.first!.value).equal('a');
			expect(list.removeLast()).toBe(true);
			expect(list.removeLast()).toBe(false);
		});
	});

	describe('.takeLast()', () => {
		it('should retrieve first value in list and undefined if none left', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			expect(list.takeLast()!.value).equal('b');
			expect(list.takeLast()!.value).equal('a');
			expect(list.takeLast()).toBeUndefined();
		});

		it('should throw if node is corrupted', () => {
			const list = new LinkedValueNodeList<string>();
			const last = {value: 'b'};
			list.addNode({value: 'a'}).addNode(last);
			// @ts-ignore
			last.next = {value: 'c'};
			expect(() => list.takeLast()).toThrow();
		});

		it('should throw if unable to be removed', () => {
			const list = new LinkedValueNodeList<string>();
			const last = {value: 'b'};
			list.addNode({value: 'a'}).addNode(last);
			// @ts-ignore
			last.previous = undefined;
			expect(() => list.takeLast()).toThrow();
		});
	});

	describe('.removeNode(node)', () => {
		it('should throw if node is null', () => {
			const list = new LinkedValueNodeList<string>();
			//@ts-expect-error
			expect(() => list.removeNode(null)).toThrow();
		});
	});

	describe('.reversed', () => {
		it('should iterate in reverse', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'});
			let a: NodeWithValue<string>[] = [];
			for(const n of list.reversed)
			{
				a.push(n);
			}
			expect(a[0].value).equal('b');
			expect(a[1].value).equal('a');
			a = list.reversed.toArray();
			expect(a[0].value).equal('b');
			expect(a[1].value).equal('a');
		});
	});

	describe('.toArray()', () => {
		it('should return the nodes as an array', () => {
			const list = new LinkedValueNodeList<string>();
			list.addNode({value: 'a'}).addNode({value: 'b'}).addNode({value: 'c'});
			const a = list.toArray();
			expect(a[0].value).equal('a');
			expect(a[1].value).equal('b');
		});
	});
});
