import { PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Entity } from 'typeorm';
import { Vip } from './vip';
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn() id: number;
  @Column({nullable: true})
  name: string;
  @Column({nullable: true})
  itemId: number;
  @Column({nullable: true})
  categoryId: number;
  @Column({nullable: true})
  productIndex: number;
  @Column({nullable: true})
  tragetProductIndex: number;
  @Column({nullable: true})
  sortIndex: number;
  @Column({nullable: true})
  combtIndex: number;
  @Column({nullable: true})
  pIndex: number;
  @Column({nullable: true})
  eIndex: number;
  @Column({nullable: true})
  targetFIndex: number;
  @ManyToOne((type) => Vip, (vip) => vip.collections)
  vip: Vip;
}
