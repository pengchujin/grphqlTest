import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany
} from 'typeorm';
import { Collection } from './Collection';

@Entity('vips')
export class Vip {
  @PrimaryGeneratedColumn() id: number;

  @Column({
    length: '20'
  })
  @Index({ unique: true })
  username: string;

  @Column('text') encryptedPassword: string;

  @OneToMany((type) => Collection, (collection) => collection.vip, {eager: true, nullable: true})
  collections: Collection[];
}
