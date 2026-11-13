// The version the docs print (GA review S7): the generator's rule, not Maven Central's <release>.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseVersion, metadataVersions, starterPin } from './mateu-version.mjs';

const metadata = (release, ...versions) =>
	`<metadata><versioning><release>${release}</release><versions>${versions.map((v) => `<version>${v}</version>`).join('')}</versions></versioning></metadata>`;

test('before the GA, the newest pre-release of the pinned major', () => {
	const xml = metadata('3.0-beta.64', '3.0-alpha.412', '3.0-beta.9', '3.0-beta.63', '3.0-beta.64', '0.0.1');
	assert.equal(chooseVersion(metadataVersions(xml), '3.0-beta.63'), '3.0-beta.64');
});

test('after the GA, the highest final even when <release> is a later-line pre-release', () => {
	const xml = metadata('3.1-rc.1', '3.0-beta.64', '3.0-rc.1', '3.0.0', '3.0.1', '3.1-rc.1');
	assert.equal(chooseVersion(metadataVersions(xml), '3.0.0'), '3.0.1');
});

test('a backport deployed after a later minor does not take over', () => {
	const xml = metadata('3.0.2', '3.0.0', '3.0.1', '3.1.0', '3.0.2');
	assert.equal(chooseVersion(metadataVersions(xml), '3.1.0'), '3.1.0');
});

test('another major is not offered, and nothing qualifying gives null', () => {
	assert.equal(chooseVersion(['3.0.0', '4.0.0'], '3.0.0'), '3.0.0');
	assert.equal(chooseVersion(['2.9.9'], '3.0.0'), null);
	assert.equal(chooseVersion(['3.0.0'], 'not-a-version'), null);
});

test('git tags (v-prefixed by the plugin) choose the same way once the v is dropped', () => {
	assert.equal(chooseVersion(['v3.0.0', 'v3.1-rc.1', 'v3.0.1'].map((t) => t.replace(/^v/, '')), '3.0.0'), '3.0.1');
});

test("the pin is the spring-mvc starter's <mateu.version>", () => {
	const pin = starterPin();
	assert.match(pin, /^\d+\.\d+/);
});
