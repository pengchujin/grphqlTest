import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index
} from 'typeorm';
import { MotherType } from './MotherType';
import { ChildType } from './ChildType';
@Entity('pic')

export class Pic {
  @PrimaryGeneratedColumn() id: number;

  @Column({default: false})
  isLong: boolean;

  @Column({nullable: true})
  url: String;

  @ManyToOne((type) => ChildType, (ChildType) => ChildType.pics, {eager: true})
  childType: ChildType;

}
