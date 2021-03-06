import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  Index
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn() id: number;

  @Column({
    length: '20'
  })
  @Index({ unique: true })
  username: string;

  @Column('text') encryptedPassword: string;
}
