import { PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Entity } from 'typeorm';
import { Vip } from './vip';
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn() id: number;
  @Column({nullable: true})
  name: string;
  @Column({nullable: true})
  uuid: string;
  @Column({nullable: true})
  productId: number;
  @Column({nullable: true})
  tagId: number;
  @Column('text', {array: true, nullable: true})
  elementIds: number[];
  @Column({nullable: true})
  combinationId: number;
  @ManyToOne((type) => Vip, (vip) => vip.collections)
  vip: Vip;
}
