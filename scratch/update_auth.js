const fs = require('fs');

const enFile = 'frontend/src/locales/en.json';
const teFile = 'frontend/src/locales/te.json';

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const te = JSON.parse(fs.readFileSync(teFile, 'utf8'));

const enAuthNew = {
  brand_name: 'GreenKrt',
  logo_alt: 'GreenKrt Logo',
  quote_part1: '"Smart farming',
  quote_part2: 'starts with better',
  quote_part3: 'decisions."',
  join_msg: 'Join 12,000+ farmers transforming their yield with GreenKrt.',
  start_journey: 'Start your journey',
  to_smarter: 'to smarter farming.',
  features_0: 'Free account, no credit card required',
  features_1: 'Access all farm services instantly',
  features_2: 'AI-powered soil & crop recommendations',
  features_3: 'Multi-language support (EN, తె)',
  copyright: '© 2025 GreenKrt. Trusted by 12,000+ Indian farmers.'
};

const teAuthNew = {
  brand_name: 'గ్రీన్‌కార్ట్',
  logo_alt: 'గ్రీన్‌కార్ట్ లోగో',
  quote_part1: '"స్మార్ట్ వ్యవసాయం',
  quote_part2: 'మెరుగైన నిర్ణయాలతో',
  quote_part3: 'ప్రారంభమవుతుంది."',
  join_msg: 'గ్రీన్‌కార్ట్‌తో తమ దిగుబడిని పెంచుకుంటున్న 12,000+ రైతులతో చేరండి.',
  start_journey: 'స్మార్ట్ వ్యవసాయం వైపు',
  to_smarter: 'మీ ప్రయాణాన్ని ప్రారంభించండి.',
  features_0: 'ఉచిత ఖాతా, క్రెడిట్ కార్డ్ అవసరం లేదు',
  features_1: 'అన్ని వ్యవసాయ సేవలను తక్షణమే పొందండి',
  features_2: 'AI-ఆధారిత మట్టి & పంట సిఫార్సులు',
  features_3: 'బహుళ-భాషా మద్దతు (EN, తె)',
  copyright: '© 2025 గ్రీన్‌కార్ట్. 12,000+ భారతీయ రైతుల నమ్మకం.'
};

Object.assign(en.auth, enAuthNew);
Object.assign(te.auth, teAuthNew);

fs.writeFileSync(enFile, JSON.stringify(en, null, 2));
fs.writeFileSync(teFile, JSON.stringify(te, null, 2));
console.log('JSON updated!');
