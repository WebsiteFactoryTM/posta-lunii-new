import * as migration_20261014_130325_initial from './20261014_130325_initial';

export const migrations = [
  {
    up: migration_20261014_130325_initial.up,
    down: migration_20261014_130325_initial.down,
    name: '20261014_130325_initial'
  },
];
