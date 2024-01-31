import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffe.entity';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { Flavor } from './entities/flavor.entity/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

type NewType = typeof coffeesConfig;

// @Injectable({ scope: Scope.REQUEST })
// export class CoffeesService {
//   constructor(@Inject(REQUEST) private request: Request) {} // 👈
// }
// Scope DEFAULT - This is assumed when NO Scope is entered like so: @Injectable() */
// @Injectable({ scope: Scope.DEFAULT })

/** 
 * Scope TRANSIENT 
  
 * Transient providers are NOT shared across consumers. 
 * Each consumer that injects a transient provider 
 * will receive a new, dedicated instance of that provider. 
 */

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    // @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    // private readonly configService: ConfigService, // 👈
    // @Inject(coffeesConfig.KEY)
    // private coffeesConfiguration: ConfigType<NewType>,
  ) {
    // console.log('coffeeBrands', coffeeBrands);
    /* Accessing process.env variables from ConfigService */
    // const databaseHost = this.configService.get<string>(
    //   'DATABASE_HOST',
    //   'localhost',
    // );
    /**
     * Grabbing this nested property within our App - Custom Config files
     * via "dot notation" (a.b)
     */
    // const databaseHost = this.configService.get('database.host', 'localhost');
    // console.log('databaseHost: ', databaseHost);
    // ⚠️ sub optimal ways of retrieving Config ⚠️
    /* Grab coffees config within App */
    // const coffeesConfig = this.configService.get('coffees');
    // console.log(coffeesConfig);
    /* Grab nested property within coffees config - more difficult to test */
    // const foo = this.configService.get('coffees.foo');
    // console.log(foo);
    // Now strongly typed, and able to access properties via:
    // console.log('strongly typed: ', coffeesConfiguration.foo);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: {
        flavors: true, // 👈
      },
      skip: offset, // 👈
      take: limit, // 👈
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: {
        id: +id,
      },
      relations: {
        flavors: true,
      },
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    }); // 👈 notice the "where"
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;

      const recommendEvent = new CustomEvent('recommend_coffee', 'coffee', {
        coffeeId: coffee.id,
      });

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}

export class CustomEvent {
  payload: Record<string, any>;
  name: string;
  type: string;

  constructor(type: string, name: string, payload: Record<string, any>) {
    // super(type);
    this.type = type;
    this.name = name;
    this.payload = payload;
  }
}
