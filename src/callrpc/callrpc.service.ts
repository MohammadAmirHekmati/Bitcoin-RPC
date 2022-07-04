import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcClient, RpcClientOptions, RpcRequest, RpcResponse } from 'jsonrpc-ts';

@Injectable()
export class CallrpcService {

  async bitcoinRpcOptions():Promise<RpcClientOptions>
  {
    // Set your Fullnode Host address
        const HOST=""
        // Set your port 
        const PORT=12315640

    const liteRpcOptions:RpcClientOptions=
      {
        // Set username and password of your RPC server
        auth:{username:"",password:""}, 
        headers:{"content-type": "text/plain;"},
        timeout:60000,
        url:`http://${HOST}:${PORT}`,
        method:"post"
      }

    return liteRpcOptions
  }

  async walletOptions():Promise<WalletOptions>
  {
    const walletOptions:WalletOptions=
      {
        // Set Target Wallet
        target_wallet:"",
        // Set the password of the wallet on fullnode
        wallet_pass:""
      }

    return walletOptions
  }

  async bitcoinCallRpc(method:string,params:any[]):Promise<RpcResponse<any>>
  {
    const rpcOptions=await this.bitcoinRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id:Math.floor(Math.random() * 99999 - 11111),
        jsonrpc:"2.0",
        method:method,
        params:params
      }
    const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException(`Rpc Reqest Failed...!`)

    return sendRequest.data
  }

}

export class WalletOptions {
  wallet_pass:string
  target_wallet:string
}