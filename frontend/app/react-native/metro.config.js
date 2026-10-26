// Metro, as Expo configures it, plus ONE folder outside the project: the shared web library's
// sources (frontend/web/monorepo/libs/mateu/src). The native renderer imports the platform-neutral
// part of it — the static-bundle resolver and the client-side expander — through
// src/shared/mateuLib.ts instead of keeping a second copy (see that file). Those files import
// nothing from node_modules, so only the watch list changes.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const sharedLib = path.resolve(__dirname, '../../web/monorepo/libs/mateu/src');
config.watchFolders = [...(config.watchFolders ?? []), sharedLib];

module.exports = config;
