import * as colors from 'material-colors';
import * as _ from 'lodash';

function mapByNumber(num: number, shift: number = 0): string[] {
  let map = [ 
    'pink', 'purple', 'cyan', 'red', 'blue', 'lightBlue', 
    'deepPurple', 'lime', 'teal', 'brown', 'orange' ].map(
    color => colors[color][num]
  );

  shift = shift % map.length;

  if (shift) {
    let shiftElements = map.splice(0, shift);
    map.push.apply(map, shiftElements);
  }

  return map;
}

const ThemeColors = mapByNumber(800);
const themes = [
  mapByNumber(800),
  mapByNumber(700, 2),
  mapByNumber(600, 4),
  mapByNumber(500, 6),
  mapByNumber(400, 8),
  mapByNumber(300, 10),
  mapByNumber(200, 12),
  mapByNumber(100, 14)
]

const DangerColor = colors.red[500];
const PersonColor = colors.teal[700];
const IntentsColor = colors.teal.a700;
const GoodColor = colors.lightBlue[700];
const BadColor = colors.red[700];
const PositiveColor = colors.lightBlue[700];
const NeutralColor = colors.grey[500];

function getColor(idx: number): any {
  return ThemeColors[idx];
}

export {
  ThemeColors,
  themes,
  
  DangerColor,
  PersonColor,
  IntentsColor,

  GoodColor,
  BadColor,

  PositiveColor,
  NeutralColor,

  getColor
};
