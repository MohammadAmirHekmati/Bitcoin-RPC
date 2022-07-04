import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitcoinPendingTransactionEntity } from './entities/bitcoin-pending-transaction.entity';
import { BitcoinReceiveTransactionEntity } from './entities/bitcoin-receive-transaction.entity';
import { BitcoinService } from './services/bitcoin.service';
import { BitcoinSendTransactionEntity } from './entities/bitcoin-send-transaction.entity';
import { BitcoinWalletEntity } from './entities/bitcoin-wallet.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BitcoinController } from './controllers/bitcoin.controller';
import { CallrpcService } from '../callrpc/callrpc.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([BitcoinPendingTransactionEntity,BitcoinReceiveTransactionEntity,BitcoinSendTransactionEntity,BitcoinWalletEntity]),
    ScheduleModule.forRoot()
  ],
  controllers:[BitcoinController],
  providers:[BitcoinService,CallrpcService]
})
export class BitcoinModule {}
