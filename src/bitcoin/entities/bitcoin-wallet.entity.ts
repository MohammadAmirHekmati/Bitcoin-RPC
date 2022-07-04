import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:"crypto_bitcoin-wallet"})
export class BitcoinWalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  address:string

  @CreateDateColumn()
  createAt:Date
}