/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {describe, it, expect} from 'vitest';
import {LinkedNodeList} from '../src/LinkedNodeList';

describe('LinkedNodeList Version Checking', () => {
	it('should throw if modified while iterating', () => {
		const list = new LinkedNodeList();
		
		// Add some initial nodes
		list.addNode({});
		list.addNode({});
		list.addNode({});
		
		console.log('Initial count:', list.unsafeCount);
		console.log('Initial version:', list.version);
		
		// This should throw when the collection is modified during iteration
		expect(() => {
			let iterationCount = 0;
			for (const node of list) {
				iterationCount++;
				console.log(`Iteration ${iterationCount}: processing node`);
				console.log('Before add - version:', list.version);
				list.addNode({});
				console.log('After add - version:', list.version);
			}
			console.log('Loop completed without throwing. Total iterations:', iterationCount);
		}).toThrow('Version mismatch. The collection was modified.');
	});
});
