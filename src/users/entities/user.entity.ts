import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Task } from '../../tasks/entities/task.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    email: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Team, team => team.members)
    team: Team | null;

    @ManyToMany(() => Task, task => task.assignees)
    assignedTasks: Task[];
}