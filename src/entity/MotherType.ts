import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index
} from 'typeorm';
import { ChildType } from './ChildType';
@Entity('motherTypes')

export class MotherType {
  @PrimaryGeneratedColumn() id: number;

  @Column({ nullable: true })
  title: string;

  @Column({nullable: true})
  enTitle: string;

  @Column({default: false})
  isShow: boolean;

  @Column({nullable: true})
  banner: string;

  @Column({nullable: true})
  enBanner: string;

  @OneToMany((type) => ChildType, (childType) => childType.motherType, {eager: true})
  childTypes: ChildType[];
}
