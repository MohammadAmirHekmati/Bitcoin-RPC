import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BitcoinService } from '../services/bitcoin.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';

@Controller("bitcoin")
export class BitcoinController {
  constructor(private bitcoinService:BitcoinService) {
  }

  @Get("wallet/notify")
  async walletNotify(@Query("transaction") transaction:any):Promise<any>
  {
    return await this.bitcoinService.walletNotify(transaction)
  }

  @Get("core/balance")
  async getCoreWalletBalance():Promise<any>
  {
    return await this.bitcoinService.getCoreWalletBalance()
  }

  @Post("send/transaction")
  async sendTransaction(@Body() sendTransactionDto:SendTransactionDto):Promise<any>
  {
    return await this.bitcoinService.sendTransaction(sendTransactionDto)
  }

  @Get("check/transaction/:txId")
  async checkTransaction(@Param("txId") txId:string):Promise<any>
  {
    return await this.bitcoinService.checkTransaction(txId)
  }

  @Get("generate/new/address")
  async generateNewAddress():Promise<any>
  {
    return await this.bitcoinService.generateNewAddress()
  }

  @Get("dump/private/key/:address")
  async dumpPrivateKey(@Param("address") address:string):Promise<any>
  {
    return await this.bitcoinService.dumpPrivateKey(address)
  }
}