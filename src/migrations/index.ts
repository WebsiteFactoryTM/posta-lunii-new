import * as migration_20261014_130325_initial from './20261014_130325_initial';
import * as migration_20261029_142211_orders_product_line from './20261029_142211_orders_product_line';

export const migrations = [
  {
    up: migration_20261014_130325_initial.up,
    down: migration_20261014_130325_initial.down,
    name: '20261014_130325_initial',
  },
  {
    up: migration_20261029_142211_orders_product_line.up,
    down: migration_20261029_142211_orders_product_line.down,
    name: '20261029_142211_orders_product_line'
  },
];
