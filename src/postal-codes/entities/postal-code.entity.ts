import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { StreetNumber } from '../../street-numbers/entities/street-number.entity';

@Entity('postal_codes')
export class PostalCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 16 })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StreetNumber, (streetNumber) => streetNumber.postalCode, {
    cascade: false,
    eager: false,
  })
  streetNumbers!: StreetNumber[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
