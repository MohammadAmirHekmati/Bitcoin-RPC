import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CallrpcModule } from './callrpc/callrpc.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';

@Module({
  imports: [DatabaseModule, CallrpcModule, BitcoinModule]
})
export class AppModule {}
