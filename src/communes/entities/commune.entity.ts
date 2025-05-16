import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Region } from '../../regions/entities/region.entity';
import { Street } from '../../streets/entities/street.entity';

@Entity('communes')
export class Commune {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 128, unique: true })
  normalizedName: string;

  @ManyToOne(() => Region, (region) => region.communes)
  @JoinColumn({ name: 'regionId' })
  region: Region;

  @Column()
  regionId: string;

  @OneToMany(() => Street, (street) => street.commune)
  streets: Street[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
