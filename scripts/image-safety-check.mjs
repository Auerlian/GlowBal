import { __imageSafetyTestables } from '../src/services/universityDataService.js';

const { isBlockedImageCandidate, pickPrimaryCandidate } = __imageSafetyTestables;

const offenders = [
  {
    school: 'Technical University of Munich',
    candidate: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Logo_of_the_Technical_University_of_Munich.svg',
      title: 'Logo of the Technical University of Munich',
      source: 'wikidata-commons'
    }
  },
  {
    school: 'University of Cambridge',
    candidate: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg',
      title: 'Coat of Arms of the University of Cambridge',
      source: 'wikidata-commons'
    }
  }
];

let failures = 0;

for (const entry of offenders) {
  if (!isBlockedImageCandidate(entry.candidate)) {
    failures += 1;
    console.error(`FAIL: ${entry.school} offender was not blocked`);
  }
}

const safeWinner = pickPrimaryCandidate([
  offenders[0].candidate,
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/TUM_Stammgelaende_2012.jpg/1280px-TUM_Stammgelaende_2012.jpg',
    title: 'TUM campus building',
    source: 'fallback'
  }
]);

if (!safeWinner || safeWinner.url.endsWith('.svg')) {
  failures += 1;
  console.error('FAIL: Primary selector did not rotate to safe photo candidate');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: image safety checks succeeded');
