const test = require('node:test');
const os = require('node:os');
const path = require('node:path');
process.env.SENTINEL_DATA_DIR = path.join(os.tmpdir(), 'sentinel-test');
// Start every run with a clean data folder so tests are repeatable.
require('node:fs').rmSync(process.env.SENTINEL_DATA_DIR, { recursive: true, force: true });
const assert = require('node:assert');
const { xpForLevel, addXp, getUser, leaderboard } = require('../src/lib/levels');
const { parseDuration } = require('../src/commands/moderation/timeout');
const { progressBar } = require('../src/lib/embeds');

test('xp curve grows', () => {
    assert.equal(xpForLevel(0), 100);
    assert.equal(xpForLevel(1), 155);
    assert.ok(xpForLevel(10) > xpForLevel(9));
});

test('addXp levels up and carries remainder', () => {
    const g = 'test-guild', u = 'test-user';
    const { leveledUp, user } = addXp(g, u, 120);
    assert.equal(leveledUp, true);
    assert.equal(user.level, 1);
    assert.equal(user.xp, 20);
    assert.equal(leaderboard(g)[0].total, 120);
    assert.equal(getUser(g, u).level, 1);
});

test('parseDuration', () => {
    assert.equal(parseDuration('10m'), 600_000);
    assert.equal(parseDuration('2H'), 7_200_000);
    assert.equal(parseDuration('1d'), 86_400_000);
    assert.equal(parseDuration('0m'), 0);
    assert.equal(parseDuration('abc'), null);
});

test('progressBar', () => {
    assert.equal(progressBar(5, 10, 10), '▰▰▰▰▰▱▱▱▱▱');
    assert.equal(progressBar(0, 0, 4), '▱▱▱▱');
});
