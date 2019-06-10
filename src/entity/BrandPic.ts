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

export class BrandPic {
  @PrimaryGeneratedColumn() id: number;

  @Column({nullable: true})
  name: String;

  @Column({nullable: true})
  url: String;

  @Column({default: 0})
  order: Number;

  @Column({default: 0})
  languageType: Number;
}
