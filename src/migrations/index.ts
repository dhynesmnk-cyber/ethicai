import * as migration_20261022_210754_initial from './20261022_210754_initial';

export const migrations = [
  {
    up: migration_20261022_210754_initial.up,
    down: migration_20261022_210754_initial.down,
    name: '20261022_210754_initial'
  },
];
