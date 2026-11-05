// The hub keeps its list of UIs, cached manifests and screen snapshots in AsyncStorage, whose Android
// database stops accepting writes at 6 MB by default: a full phone would silently lose its list.
const { withGradleProperties } = require('expo/config-plugins');

module.exports = (config, megabytes = 64) =>
  withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((p) => !(p.type === 'property' && p.key === 'AsyncStorage_db_size_in_MB'));
    c.modResults.push({ type: 'property', key: 'AsyncStorage_db_size_in_MB', value: String(megabytes) });
    return c;
  });
