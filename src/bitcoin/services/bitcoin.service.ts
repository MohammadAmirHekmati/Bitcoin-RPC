import { Injectable } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BitcoinWalletEntity } from '../entities/bitcoin-wallet.entity';
import { Repository } from 'typeorm';
import { BitcoinPendingTransactionEntity } from '../entities/bitcoin-pending-transaction.entity';
import { BitcoinSendTransactionEntity } from '../entities/bitcoin-send-transaction.entity';
import { BitcoinReceiveTransactionEntity } from '../entities/bitcoin-receive-transaction.entity';
import { CheckTransactionResponse } from '../interfaces/check-transaction.response';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { RpcResponse } from 'jsonrpc-ts';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BitcoinService {
  constructor(private callRpcService:CallrpcService,
              @InjectRepository(BitcoinWalletEntity) private bitcoinWalletRepo:Repository<BitcoinWalletEntity>,
              @InjectRepository(BitcoinPendingTransactionEntity) private bitcoinPendingTransactionRepo:Repository<BitcoinPendingTransactionEntity>,
              @InjectRepository(BitcoinSendTransactionEntity) private bitcoinSendTransactionRepo:Repository<BitcoinSendTransactionEntity>,
              @InjectRepository(BitcoinReceiveTransactionEntity) private bitcoinReceiveTransactionRepo:Repository<BitcoinReceiveTransactionEntity>)
  {}

  async walletNotify(transaction:any):Promise<any>
  {
    const checkTransaction:CheckTransactionResponse=await this.checkTransaction(transaction)
    if (checkTransaction.confirmations<1)
    {
      const transactionDetail=checkTransaction.details[0]
      if (transactionDetail.category=="receive")
      {
        const findPendingTransaction=await this.bitcoinPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const bitcoinPendingTransactionEntity=new BitcoinPendingTransactionEntity()
          bitcoinPendingTransactionEntity.account=transactionDetail.account
          bitcoinPendingTransactionEntity.address=transactionDetail.address
          bitcoinPendingTransactionEntity.amount=transactionDetail.amount
          bitcoinPendingTransactionEntity.category=transactionDetail.category
          bitcoinPendingTransactionEntity.confirmations=checkTransaction.confirmations
          bitcoinPendingTransactionEntity.label=transactionDetail.label
          bitcoinPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          bitcoinPendingTransactionEntity.time=checkTransaction.time
          bitcoinPendingTransactionEntity.txid=checkTransaction.txid
          const saved=await this.bitcoinPendingTransactionRepo.save(bitcoinPendingTransactionEntity)
          console.log(`We gonna receive some Litecoin  txId: ${checkTransaction.txid}`);
        }
      }
      if (transactionDetail.category=="send")
      {
        const findPendingTransaction=await this.bitcoinPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const bitcoinPendingTransactionEntity=new BitcoinPendingTransactionEntity()
          bitcoinPendingTransactionEntity.account=transactionDetail.account
          bitcoinPendingTransactionEntity.address=transactionDetail.address
          bitcoinPendingTransactionEntity.amount=transactionDetail.amount
          bitcoinPendingTransactionEntity.category=transactionDetail.category
          bitcoinPendingTransactionEntity.confirmations=checkTransaction.confirmations
          bitcoinPendingTransactionEntity.label=transactionDetail.label
          bitcoinPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          bitcoinPendingTransactionEntity.time=checkTransaction.time
          bitcoinPendingTransactionEntity.txid=checkTransaction.txid
          bitcoinPendingTransactionEntity.fee=transactionDetail.fee
          const savedPendingTransaction=await this.bitcoinPendingTransactionRepo.save(bitcoinPendingTransactionEntity)
          console.log(`We lose some Lite...!  txId: ${checkTransaction.txid}`);
        }
      }
    }
  }

  async checkTransaction(txId:string):Promise<any>
  {
    const method="gettransaction"
    const params=[`${txId}`]
    const sendChechTransactionRequest=await this.callRpcService.bitcoinCallRpc(method,params)
    return sendChechTransactionRequest.result
  }

  async sendTransaction(sendTransactionDto:SendTransactionDto):Promise<RpcResponse<any>>
  {
    const {amount,commentFrom,commentTo,subtractFee,targetWallet}=sendTransactionDto
    const method="sendtoaddress"
    const params=[`${targetWallet}`,amount, `${commentFrom}`,`${commentTo}`,subtractFee]
    const sendTransactionRequest=await this.callRpcService.bitcoinCallRpc(method,params)
    return sendTransactionRequest.result
  }

  async getCoreWalletBalance():Promise<any>
  {
    const method="getbalance"
    const params=[]
    const sendRpcRequest=await this.callRpcService.bitcoinCallRpc(method,params)
    return sendRpcRequest.result
  }

  async unlockWallet(master_pass:string):Promise<any>
  {
    const method="walletpassphrase"
    const params=[`${master_pass}`,60]
    const sendUnlockRequest=await this.callRpcService.bitcoinCallRpc(method,params)
  }

  async generateNewAddress():Promise<any>
  {
    const method="getnewaddress"
    const params=[]
    const sendGenerateRequest=await this.callRpcService.bitcoinCallRpc(method,params)

    const bitcoinWalletEntity=new BitcoinWalletEntity()
    bitcoinWalletEntity.address=sendGenerateRequest.result
    const savedWalletAddress=await this.bitcoinWalletRepo.save(bitcoinWalletEntity)

    return sendGenerateRequest.result

  }

  async dumpPrivateKey(address:string):Promise<any>
  {
    const method="dumpprivkey"
    const params=[`${address}`]
    const walletPass=await this.callRpcService.walletOptions()
    const unlockWallet=await this.unlockWallet(walletPass.wallet_pass)
    const sendDumpRequest=await this.callRpcService.bitcoinCallRpc(method,params)
    if (sendDumpRequest.error)
      return sendDumpRequest.error

    return sendDumpRequest.result
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async transferBalanceToMaster()
  {
    const walletOptions=await this.callRpcService.walletOptions()
    const setBalanceForTransfer=2
    const getCoreWalletBalance=await this.getCoreWalletBalance()
    if (getCoreWalletBalance<=setBalanceForTransfer)
      console.log(`Balance is not enough fo transfer to Master`);

    if (getCoreWalletBalance>setBalanceForTransfer)
    {
      const sendTransactionDto:SendTransactionDto=
        {
          targetWallet:walletOptions.target_wallet,
          subtractFee:true,
          commentTo:"",
          commentFrom:"",
          amount:getCoreWalletBalance
        }

      const sendTransactionToMasterWallet=await this.sendTransaction(sendTransactionDto)
      if (sendTransactionToMasterWallet.error)
        console.log(`Transfer to Master failed`);

      console.log(sendTransactionToMasterWallet.result);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingTransactions()
  {
    const findPendingTransactions=await this.bitcoinPendingTransactionRepo.find()
    for (let pendingTransactions of findPendingTransactions) {
      const checkTransaction:CheckTransactionResponse=await this.checkTransaction(pendingTransactions.txid)

      if (checkTransaction.confirmations>0)
      {
        const transactionDetail=checkTransaction.details[0]
        if (transactionDetail.category=="receive")
        {
          const findReceivedTransaction=await this.bitcoinReceiveTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findReceivedTransaction)
          {
            findReceivedTransaction.confirmations=checkTransaction.confirmations
            const savedReceivedTransaction=await this.bitcoinReceiveTransactionRepo.save(findReceivedTransaction)
            console.log(`this Receive transaction confirmation goes up txId: ${checkTransaction.txid}`);
          }
          if (!findReceivedTransaction)
          {
            const bitcoinReceiveTransactionEntity=new BitcoinReceiveTransactionEntity()
            bitcoinReceiveTransactionEntity.account=transactionDetail.account
            bitcoinReceiveTransactionEntity.address=transactionDetail.address
            bitcoinReceiveTransactionEntity.amount=transactionDetail.amount
            bitcoinReceiveTransactionEntity.confirmations=checkTransaction.confirmations
            bitcoinReceiveTransactionEntity.label=transactionDetail.label
            bitcoinReceiveTransactionEntity.receiveTime=checkTransaction.timereceived
            bitcoinReceiveTransactionEntity.time=checkTransaction.time
            bitcoinReceiveTransactionEntity.txid=checkTransaction.txid
            const saveReceivedTransaction=await this.bitcoinReceiveTransactionRepo.save(bitcoinReceiveTransactionEntity)
            console.log(`This Transaction Received...!  txId: ${checkTransaction.txid}`);
          }
        }

        if (transactionDetail.category=="send")
        {
          const findSendTransaction=await this.bitcoinSendTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findSendTransaction)
          {
            findSendTransaction.confirmations=checkTransaction.confirmations
            const savedSendTransaction=await this.bitcoinSendTransactionRepo.save(findSendTransaction)
            console.log(`this send Transaction confirmation goes up  txId: ${checkTransaction.txid}`);
          }
          if (!findSendTransaction)
          {
            const bitcoinSendTransactionEntity=new BitcoinSendTransactionEntity()
            bitcoinSendTransactionEntity.address=transactionDetail.address
            bitcoinSendTransactionEntity.amount=transactionDetail.amount
            bitcoinSendTransactionEntity.category=transactionDetail.category
            bitcoinSendTransactionEntity.confirmations=checkTransaction.confirmations
            bitcoinSendTransactionEntity.fee=transactionDetail.fee
            bitcoinSendTransactionEntity.label=transactionDetail.label
            bitcoinSendTransactionEntity.receiveTime=checkTransaction.timereceived
            bitcoinSendTransactionEntity.time=checkTransaction.time
            bitcoinSendTransactionEntity.txid=checkTransaction.txid
            const saveSendTransaction=await this.bitcoinSendTransactionRepo.save(bitcoinSendTransactionEntity)
            console.log(`We lose some doge...!  txId: ${checkTransaction.txid}`);
          }
        }
      }
    }

  }
}