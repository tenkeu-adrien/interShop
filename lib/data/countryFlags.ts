// Conversion du nom d'un pays (FR ou EN) vers son drapeau emoji.

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const codeToFlag = (code: string): string => {
  const upper = code.trim().toUpperCase();
  if (upper.length !== 2 || !/^[A-Z]{2}$/.test(upper)) return '';
  return String.fromCodePoint(...upper.split('').map((c) => 127397 + c.charCodeAt(0)));
};

// Noms de pays utilisés par l'application (voir lib/data/productOptions.ts)
const FR_NAME_TO_CODE: Record<string, string> = {
  afghanistan: 'AF',
  'afrique du sud': 'ZA',
  albanie: 'AL',
  algerie: 'DZ',
  allemagne: 'DE',
  andorre: 'AD',
  angola: 'AO',
  'antigua et barbuda': 'AG',
  'arabie saoudite': 'SA',
  argentine: 'AR',
  armenie: 'AM',
  australie: 'AU',
  autriche: 'AT',
  azerbaidjan: 'AZ',
  bahamas: 'BS',
  bahrein: 'BH',
  bangladesh: 'BD',
  barbade: 'BB',
  belgique: 'BE',
  belize: 'BZ',
  benin: 'BJ',
  bhoutan: 'BT',
  bielorussie: 'BY',
  birmanie: 'MM',
  bolivie: 'BO',
  'bosnie herzegovine': 'BA',
  botswana: 'BW',
  bresil: 'BR',
  brunei: 'BN',
  bulgarie: 'BG',
  'burkina faso': 'BF',
  burundi: 'BI',
  cambodge: 'KH',
  cameroun: 'CM',
  canada: 'CA',
  'cap vert': 'CV',
  centrafrique: 'CF',
  chili: 'CL',
  chine: 'CN',
  chypre: 'CY',
  colombie: 'CO',
  comores: 'KM',
  congo: 'CG',
  'congo rdc': 'CD',
  'congo kinshasa': 'CD',
  'congo brazzaville': 'CG',
  'rd congo': 'CD',
  'rdc': 'CD',
  'republique democratique du congo': 'CD',
  'coree du nord': 'KP',
  'coree du sud': 'KR',
  'costa rica': 'CR',
  "cote d ivoire": 'CI',
  croatie: 'HR',
  cuba: 'CU',
  danemark: 'DK',
  djibouti: 'DJ',
  dominique: 'DM',
  egypte: 'EG',
  'emirats arabes unis': 'AE',
  equateur: 'EC',
  erythree: 'ER',
  espagne: 'ES',
  estonie: 'EE',
  eswatini: 'SZ',
  'etats unis': 'US',
  'etats unis d amerique': 'US',
  usa: 'US',
  ethiopie: 'ET',
  fidji: 'FJ',
  finlande: 'FI',
  france: 'FR',
  gabon: 'GA',
  gambie: 'GM',
  georgie: 'GE',
  ghana: 'GH',
  grece: 'GR',
  grenade: 'GD',
  guatemala: 'GT',
  guinee: 'GN',
  'guinee bissau': 'GW',
  'guinee equatoriale': 'GQ',
  guyana: 'GY',
  haiti: 'HT',
  honduras: 'HN',
  hongrie: 'HU',
  inde: 'IN',
  indonesie: 'ID',
  irak: 'IQ',
  iran: 'IR',
  irlande: 'IE',
  islande: 'IS',
  israel: 'IL',
  italie: 'IT',
  jamaique: 'JM',
  japon: 'JP',
  jordanie: 'JO',
  kazakhstan: 'KZ',
  kenya: 'KE',
  kirghizistan: 'KG',
  kiribati: 'KI',
  koweit: 'KW',
  laos: 'LA',
  lesotho: 'LS',
  lettonie: 'LV',
  liban: 'LB',
  liberia: 'LR',
  libye: 'LY',
  liechtenstein: 'LI',
  lituanie: 'LT',
  luxembourg: 'LU',
  'macedoine du nord': 'MK',
  madagascar: 'MG',
  malaisie: 'MY',
  malawi: 'MW',
  maldives: 'MV',
  mali: 'ML',
  malte: 'MT',
  maroc: 'MA',
  marshall: 'MH',
  maurice: 'MU',
  mauritanie: 'MR',
  mexique: 'MX',
  micronesie: 'FM',
  moldavie: 'MD',
  monaco: 'MC',
  mongolie: 'MN',
  montenegro: 'ME',
  mozambique: 'MZ',
  namibie: 'NA',
  nauru: 'NR',
  nepal: 'NP',
  nicaragua: 'NI',
  niger: 'NE',
  nigeria: 'NG',
  norvege: 'NO',
  'nouvelle zelande': 'NZ',
  oman: 'OM',
  ouganda: 'UG',
  ouzbekistan: 'UZ',
  pakistan: 'PK',
  palaos: 'PW',
  palestine: 'PS',
  panama: 'PA',
  'papouasie nouvelle guinee': 'PG',
  paraguay: 'PY',
  'pays bas': 'NL',
  perou: 'PE',
  philippines: 'PH',
  pologne: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  'republique dominicaine': 'DO',
  'republique tcheque': 'CZ',
  tchequie: 'CZ',
  roumanie: 'RO',
  'royaume uni': 'GB',
  uk: 'GB',
  russie: 'RU',
  rwanda: 'RW',
  'saint christophe et nieves': 'KN',
  'sainte lucie': 'LC',
  'saint marin': 'SM',
  'saint vincent et les grenadines': 'VC',
  salomon: 'SB',
  salvador: 'SV',
  samoa: 'WS',
  'sao tome et principe': 'ST',
  senegal: 'SN',
  serbie: 'RS',
  seychelles: 'SC',
  'sierra leone': 'SL',
  singapour: 'SG',
  slovaquie: 'SK',
  slovenie: 'SI',
  somalie: 'SO',
  soudan: 'SD',
  'soudan du sud': 'SS',
  'sri lanka': 'LK',
  suede: 'SE',
  suisse: 'CH',
  suriname: 'SR',
  syrie: 'SY',
  tadjikistan: 'TJ',
  tanzanie: 'TZ',
  tchad: 'TD',
  thailande: 'TH',
  'timor oriental': 'TL',
  togo: 'TG',
  tonga: 'TO',
  'trinite et tobago': 'TT',
  tunisie: 'TN',
  turkmenistan: 'TM',
  turquie: 'TR',
  tuvalu: 'TV',
  ukraine: 'UA',
  uruguay: 'UY',
  vanuatu: 'VU',
  vatican: 'VA',
  venezuela: 'VE',
  vietnam: 'VN',
  yemen: 'YE',
  zambie: 'ZM',
  zimbabwe: 'ZW',
};

const ALL_CODES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' '
  );

let intlCodeByName: Map<string, string> | null = null;

const buildIntlCodeByName = (): Map<string, string> => {
  const map = new Map<string, string>();
  let fr: Intl.DisplayNames | null = null;
  let en: Intl.DisplayNames | null = null;
  try {
    fr = new Intl.DisplayNames(['fr'], { type: 'region' });
    en = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return map;
  }
  for (const code of ALL_CODES) {
    try {
      const frName = fr.of(code);
      if (frName) map.set(normalize(frName), code);
    } catch {
      /* code non supporté */
    }
    try {
      const enName = en.of(code);
      if (enName) map.set(normalize(enName), code);
    } catch {
      /* code non supporté */
    }
  }
  return map;
};

/**
 * Renvoie le code ISO 3166-1 alpha-2 correspondant à un nom de pays.
 * Accepte les noms français utilisés dans l'application ainsi que
 * les noms anglais (fallback via Intl.DisplayNames).
 * Renvoie une chaîne vide si le pays est inconnu.
 */
export const getCountryCode = (country?: string | null): string => {
  if (!country) return '';
  const key = normalize(country);
  if (!key) return '';

  // Si on reçoit déjà un code ISO (ex: "CD")
  if (/^[a-z]{2}$/.test(key)) {
    const upper = key.toUpperCase();
    if (ALL_CODES.includes(upper)) return upper;
  }

  const direct = FR_NAME_TO_CODE[key];
  if (direct) return direct;

  if (!intlCodeByName) intlCodeByName = buildIntlCodeByName();
  return intlCodeByName.get(key) ?? '';
};

/**
 * Renvoie le drapeau emoji correspondant à un nom de pays.
 * (Rendu en emoji ; sur Windows les emojis drapeaux s'affichent souvent
 * comme deux lettres, d'où l'usage recommandé de <CountryFlag />.)
 */
export const getCountryFlag = (country?: string | null): string => {
  const code = getCountryCode(country);
  return code ? codeToFlag(code) : '';
};
