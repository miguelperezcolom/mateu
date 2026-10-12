import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ganttSelection } from './ganttSelection.ts';

test('a selectable gantt runs its action with the task id (the GanttPage drawer)', () => {
  assert.deepEqual(ganttSelection('selectGanttTask', 't1'), {
    actionId: 'selectGanttTask',
    parameters: { _clickedTaskId: 't1' },
  });
});

test('a read-only gantt runs nothing', () => {
  assert.equal(ganttSelection(undefined, 't1'), null);
});
