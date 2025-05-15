/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('postal_codes')
@Index(['commune', 'street', 'number'], { unique: true })
export class PostalCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  commune: string;

  @Column({ type: 'varchar', length: 128 })
  street: string;

  @Column({ type: 'varchar', length: 32 })
  number: string;

  @Column({ type: 'varchar', length: 16 })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
