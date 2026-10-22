import * as migration_20261022_210754_initial from './20261022_210754_initial';
import * as migration_20261022_223646_phase1_data_model from './20261022_223646_phase1_data_model';

export const migrations = [
  {
    up: migration_20261022_210754_initial.up,
    down: migration_20261022_210754_initial.down,
    name: '20261022_210754_initial',
  },
  {
    up: migration_20261022_223646_phase1_data_model.up,
    down: migration_20261022_223646_phase1_data_model.down,
    name: '20261022_223646_phase1_data_model'
  },
];
