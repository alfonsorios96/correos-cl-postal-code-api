import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Street } from '../../streets/entities/street.entity';
import { PostalCode } from '../../postal-codes/entities/postal-code.entity';

@Entity('street_numbers')
export class StreetNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 16 })
  value: string;

  @ManyToOne(() => Street, (street) => street.numbers, { nullable: false })
  street: Street;

  @ManyToOne(() => PostalCode, { nullable: true })
  postalCode: PostalCode;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
