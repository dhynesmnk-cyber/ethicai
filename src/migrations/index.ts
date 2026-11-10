import * as migration_20261022_210754_initial from './20261022_210754_initial';
import * as migration_20261022_223646_phase1_data_model from './20261022_223646_phase1_data_model';
import * as migration_20261110_165153_family_redesign from './20261110_165153_family_redesign';
import * as migration_20261110_202619_photos_and_ai from './20261110_202619_photos_and_ai';

export const migrations = [
  {
    up: migration_20261022_210754_initial.up,
    down: migration_20261022_210754_initial.down,
    name: '20261022_210754_initial',
  },
  {
    up: migration_20261022_223646_phase1_data_model.up,
    down: migration_20261022_223646_phase1_data_model.down,
    name: '20261022_223646_phase1_data_model',
  },
  {
    up: migration_20261110_165153_family_redesign.up,
    down: migration_20261110_165153_family_redesign.down,
    name: '20261110_165153_family_redesign',
  },
  {
    up: migration_20261110_202619_photos_and_ai.up,
    down: migration_20261110_202619_photos_and_ai.down,
    name: '20261110_202619_photos_and_ai'
  },
];
