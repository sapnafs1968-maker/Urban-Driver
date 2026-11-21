const { en } = require('../src/lib/translations/en');
const { hi } = require('../src/lib/translations/hi');
const { bn } = require('../src/lib/translations/bn');
const { ta } = require('../src/lib/translations/ta');
const { te } = require('../src/lib/translations/te');
const { mr } = require('../src/lib/translations/mr');
const { gu } = require('../src/lib/translations/gu');
const { kn } = require('../src/lib/translations/kn');
const { ml } = require('../src/lib/translations/ml');
const { pa } = require('../src/lib/translations/pa');
const { ur } = require('../src/lib/translations/ur');

const languages = { en, hi, bn, ta, te, mr, gu, kn, ml, pa, ur };
const enKeys = Object.keys(en);

console.log(`\n========================================`);
console.log(`URBAN DRIVER i18n VALIDATION REPORT`);
console.log(`Total Keys Defined in English: ${enKeys.length}`);
console.log(`Total Languages Tested: ${Object.keys(languages).length}`);
console.log(`========================================\n`);

let hasErrors = false;

for (const [code, dict] of Object.entries(languages)) {
  const dictKeys = new Set(Object.keys(dict));
  const missing = [];
  const empty = [];

  for (const key of enKeys) {
    if (!dictKeys.has(key)) {
      missing.push(key);
    } else if (typeof dict[key] !== 'string' || dict[key].trim() === '') {
      empty.push(key);
    }
  }

  if (missing.length > 0 || empty.length > 0) {
    hasErrors = true;
    console.error(`❌ [${code}] FAILED: Missing ${missing.length} keys, Empty ${empty.length} keys`);
    if (missing.length > 0) console.error(`   Missing: ${missing.slice(0, 5).join(', ')}...`);
    if (empty.length > 0) console.error(`   Empty: ${empty.slice(0, 5).join(', ')}...`);
  } else {
    console.log(`✅ [${code}] 100% PASS (${enKeys.length}/${enKeys.length} keys verified)`);
  }
}

if (hasErrors) {
  console.error(`\n❌ i18n Validation FAILED with errors.\n`);
  process.exit(1);
} else {
  console.log(`\n🎉 ALL 11 LANGUAGES HAVE 100% TRANSLATION PARITY!\n`);
  process.exit(0);
}
