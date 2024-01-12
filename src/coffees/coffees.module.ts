import { Injectable, Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffe.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flavor } from './entities/flavor.entity/flavor.entity';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { Connection } from 'typeorm';

export class MockCoffeesService {}

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return [
      'buddy brew CLASS  coffeeBrandsFactory',
      'nescafe CLASS  coffeeBrandsFactory',
    ];
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])], // 👈 Adding Coffee Entity here to TypeOrmModule.forFeature
  controllers: [CoffeesController],
  // providers: [CoffeesService],
  // providers: [
  // CoffeesService,
  //   {
  //     provide: CoffeesService,
  //     useValue: new MockCoffeesService(), // <-- mock implementation
  //   },
  // ],
  // providers: [
  // CoffeesService,
  //   {
  //     provide: COFFEE_BRANDS, // 👈 String-valued token
  //     useValue: ['buddy brew', 'nescafe'], // array of coffee brands,
  //   },
  // ],
  // providers: [
  //   CoffeesService,
  //   {
  //     provide: COFFEE_BRANDS, // 👈 String-valued token
  //     useFactory: (brandsFactory: CoffeeBrandsFactory) =>
  //       brandsFactory.create(), //['buddy brew', 'nescafe'], // array of coffee brands,
  //     inject: [CoffeeBrandsFactory],
  //   },
  // ],
  providers: [
    CoffeesService,
    {
      // Asynchronous "useFactory" (async provider example)
      provide: 'COFFEE_BRANDS',
      // Note "async" here, and Promise/Async event inside the Factory function
      // Could be a database connection / API call / etc
      // In our case we're just "mocking" this type of event with a Promise
      useFactory: async (connection: Connection): Promise<string[]> => {
        // const coffeeBrands = await connection.query('SELECT * ...');
        const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe']);
        return coffeeBrands;
      },
      inject: [Connection],
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
