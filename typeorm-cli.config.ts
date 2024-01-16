import { Coffee } from 'src/coffees/entities/coffe.entity';
import { Flavor } from 'src/coffees/entities/flavor.entity/flavor.entity';
import { CoffeeRefactor1705067857012 } from 'src/migrations/1705067857012-CoffeeRefactor';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: [Coffee, Flavor],
  migrations: [CoffeeRefactor1705067857012],
});
