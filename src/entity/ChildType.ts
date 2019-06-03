import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  OneToMany
} from 'typeorm';
import { MotherType } from './MotherType';
import { Pic } from './Pic';
@Entity('childTypes')

export class ChildType {
  @PrimaryGeneratedColumn() id: number;

  @Column()
  @Index({ unique: true })
  title: string;

  @Column({default: false})
  isShow: boolean;

  @ManyToOne((type) => MotherType, (motherType) => motherType.childTypes, { eager: true})
  motherType: MotherType;

  @OneToMany((type) => Pic, (pic) => pic.childType, {eager: true})
  pics: Pic[];
}
