import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfiguration implements TypeOrmOptionsFactory{
  createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const options:TypeOrmModuleOptions=
      {
        type:"postgres",
        host:"136.243.169.68",
        port:5432,
        database:"bitcoin",
        username:"postgres",
        password:"In@FuZhZNA46uY1!",
        autoLoadEntities:true,
        synchronize:true
      }
      return options
  }

}