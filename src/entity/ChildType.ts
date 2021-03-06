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

  @Column({nullable: true})
  title: string;

  @Column({nullable: true})
  enTitle: string;

  @Column({default: false})
  isShow: boolean;

  @ManyToOne((type) => MotherType, (motherType) => motherType.childTypes)
  motherType: MotherType;

  @OneToMany((type) => Pic, (pic) => pic.childType, {eager: true})
  pics: Pic[];

  @Column({nullable: true, default: 0})
  sort: number;
}
