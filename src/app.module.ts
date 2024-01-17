import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import appConfig from './config/app.config';

/**
 * To specify another path for this file, 
 * let’s pass in an options object into the forRoot() method 
 * and set the envFilePath property like so:
   
 * In this example, we’re looking instead for a .environment file.

ConfigModule.forRoot({
  envFilePath: '.environment’,
});
* Have ConfigModule *ignore* .env files 
 * Useful when using Provider UI's such as Heroku, etc (and they handle all ENV variables)
 * ConfigModule.forRoot({
  ignoreEnvFile: true,
});
 */

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // 👈
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    // ConfigModule.forRoot({
    //   validationSchema: Joi.object({
    //     DATABASE_HOST: Joi.required(),
    //     DATABASE_PORT: Joi.number().default(5432),
    //   }),
    // }),
    ConfigModule.forRoot({
      load: [appConfig], // 👈 Custom config files
    }),
    CoffeesModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres', // type of our database
    //   host: process.env.DATABASE_HOST, // database host
    //   port: +process.env.DATABASE_PORT, // database host
    //   username: process.env.DATABASE_USER, // username
    //   password: process.env.DATABASE_PASSWORD, // user password
    //   database: process.env.DATABASE_NAME, // name of our database,
    //   autoLoadEntities: true, // models will be loaded automatically
    //   synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
    // }),
    CoffeeRatingModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
