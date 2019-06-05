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

  @Column({nullable: true})
  name: String;

  @Column({default: false})
  isLong: boolean;

  @Column({nullable: true})
  url: String;

  @Column({default: 0})
  languageType: Number;

  @ManyToOne((type) => ChildType, (ChildType) => ChildType.pics)
  childType: ChildType;

}
