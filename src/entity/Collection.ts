import { PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Entity } from 'typeorm';
import { Vip } from './vip';
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn() id: number;
  @Column({nullable: true})
  name: string;
  @Column({nullable: true})
  detailInfo: string;
  @ManyToOne((type) => Vip, (vip) => vip.collections)
  vip: Vip;
}
