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

  @Column()
  @Index({ unique: true })
  title: string;

  @Column({default: false})
  isShow: boolean;

  @Column({nullable: true})
  banner: string;

  @OneToMany((type) => ChildType, (childType) => childType.motherType, {eager: true})
  childTypes: ChildType[];
}
