import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index
} from 'typeorm';

@Entity('vips')
export class Vip {
  @PrimaryGeneratedColumn() id: number;

  @Column({
    length: '20'
  })
  @Index({ unique: true })
  username: string;

  @Column('text') encryptedPassword: string;
}
