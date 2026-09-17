import assert from 'node:assert/strict';
import { formatRelativeTime, selectNotifications } from '../src/lib/notification-view.ts';

const rows = [
  { id: 'a', category: 'schedule', createdAt: '2026-09-17T10:00:00Z' },
  { id: 'b', category: 'promotion', createdAt: '2026-09-17T11:00:00Z', readAt: '2026-09-17T11:01:00Z' },
  { id: 'c', category: 'schedule', createdAt: '2026-09-17T12:00:00Z' },
];
assert.deepEqual(selectNotifications(rows, 'schedule', 'newest').map(row => row.id), ['c', 'a']);
assert.deepEqual(selectNotifications(rows, 'all', 'oldest').map(row => row.id), ['a', 'b', 'c']);
assert.deepEqual(selectNotifications(rows, 'all', 'unread').map(row => row.id), ['c', 'a', 'b']);
assert.equal(formatRelativeTime('2026-09-17T11:40:00Z', new Date('2026-09-17T12:00:00Z')), '20 phút trước');
assert.equal(formatRelativeTime('2026-09-16T12:00:00Z', new Date('2026-09-17T12:00:00Z')), 'Hôm qua');
console.log('notification filter, sort, relative time: OK');
