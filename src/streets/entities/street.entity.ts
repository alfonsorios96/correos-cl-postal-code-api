import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Commune } from '../../communes/entities/commune.entity';
import { StreetNumber } from '../../street-numbers/entities/street-number.entity';

@Entity('streets')
export class Street {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 128, unique: false })
  normalizedName: string;

  @ManyToOne(() => Commune, { nullable: false })
  @JoinColumn({ name: 'commune_id' })
  commune: Commune;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => StreetNumber, (number) => number.street)
  numbers: StreetNumber[];
}
