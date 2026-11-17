// What Android Auto Backup keeps of the app (pure — unit-tested by src/hub/backupRules.test.ts).
//
// The hub's list of UIs ("My UIs") lives in AsyncStorage, whose Android database is RKStorage
// (@react-native-async-storage/async-storage, ReactDatabaseSupplier.DATABASE_NAME). The backup rules
// expo-secure-store installs by default include ONLY shared preferences, so the list was never
// backed up and a reinstall from the store started empty. These rules add the database and keep
// SecureStore OUT: its values are encrypted with a keystore key that does not survive a reinstall,
// so restored tokens could not be decrypted (expo-secure-store's docs say to exclude it).
//
// Android ≤ 11 reads `android:fullBackupContent`; Android 12+ (targetSdk ≥ 31) reads
// `android:dataExtractionRules`, with separate sections for the cloud backup and a device-to-device
// transfer. Auto Backup stops backing an app up when its data passes 25 MB.

const BACKUP_RULES = 'mateu_backup_rules';
const DATA_EXTRACTION_RULES = 'mateu_data_extraction_rules';

const RULES = [
  '<include domain="database" path="RKStorage"/>',
  '<include domain="sharedpref" path="."/>',
  '<exclude domain="sharedpref" path="SecureStore"/>',
];

const indent = (lines, by) => lines.map((l) => ' '.repeat(by) + l).join('\n');

const fullBackupContent = () =>
  ['<?xml version="1.0" encoding="utf-8"?>', '<!-- Auto Backup, Android 11 and lower (plugins/hub-backup-rules.js) -->', '<full-backup-content>', indent(RULES, 2), '</full-backup-content>', ''].join('\n');

const dataExtractionRules = () =>
  [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<!-- Auto Backup, Android 12 and higher (plugins/hub-backup-rules.js) -->',
    '<data-extraction-rules>',
    '  <cloud-backup>',
    indent(RULES, 4),
    '  </cloud-backup>',
    '  <device-transfer>',
    indent(RULES, 4),
    '  </device-transfer>',
    '</data-extraction-rules>',
    '',
  ].join('\n');

/** The resource files (res/xml/<name>.xml → content). */
const resourceFiles = () => ({
  [`${BACKUP_RULES}.xml`]: fullBackupContent(),
  [`${DATA_EXTRACTION_RULES}.xml`]: dataExtractionRules(),
});

/** Points the manifest's <application> at the rules (and keeps backup on). */
function applyToApplication(application) {
  application.$ = application.$ ?? {};
  application.$['android:allowBackup'] = 'true';
  application.$['android:fullBackupContent'] = `@xml/${BACKUP_RULES}`;
  application.$['android:dataExtractionRules'] = `@xml/${DATA_EXTRACTION_RULES}`;
  return application;
}

module.exports = { BACKUP_RULES, DATA_EXTRACTION_RULES, RULES, fullBackupContent, dataExtractionRules, resourceFiles, applyToApplication };
