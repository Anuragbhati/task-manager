import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createTask(createTaskDto: {
        title: string;
        description: string;
        dueDate: Date | string;
        assigneeIds?: number[];
    }) {
        if (typeof createTaskDto.dueDate === 'string') {
            createTaskDto.dueDate = new Date(createTaskDto.dueDate);
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dueDate = new Date(createTaskDto.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < now) {
            throw new BadRequestException('Due date must be current or future date');
        }

        const task = this.taskRepository.create({
            title: createTaskDto.title,
            description: createTaskDto.description,
            dueDate: createTaskDto.dueDate,
            status: TaskStatus.TODO,
        });

        if (createTaskDto.assigneeIds?.length) {
            const assignees = await this.userRepository.findBy({
                id: In(createTaskDto.assigneeIds)
            });

            if (assignees.length !== createTaskDto.assigneeIds.length) {
                const foundIds = assignees.map(user => user.id);
                const missingIds = createTaskDto.assigneeIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(`Users with IDs ${missingIds.join(', ')} not found`);
            }

            task.assignees = assignees;
        }

        return this.taskRepository.save(task);
    }

    async getAllTasks() {
        return this.taskRepository.find({
            relations: ['assignees'],
        });
    }

    async getTaskById(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['assignees'],
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return task;
    }

    async updateTask(
        id: number,
        updateTaskDto: {
            title?: string;
            description?: string;
            dueDate?: Date;
            status?: TaskStatus;
            assigneeIds?: number[];
        },
    ) {
        const task = await this.getTaskById(id);

        if (updateTaskDto.dueDate) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dueDate = new Date(updateTaskDto.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < now) {
                throw new BadRequestException('Due date must be current or future date');
            }
        }

        if (updateTaskDto.assigneeIds?.length) {
            const assignees = await this.userRepository.findBy({
                id: In(updateTaskDto.assigneeIds)
            });
            
            if (assignees.length !== updateTaskDto.assigneeIds.length) {
                const foundIds = assignees.map(user => user.id);
                const missingIds = updateTaskDto.assigneeIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(`Users with IDs ${missingIds.join(', ')} not found`);
            }
            
            task.assignees = assignees;
            delete updateTaskDto.assigneeIds;
        }

        Object.assign(task, updateTaskDto);
        return this.taskRepository.save(instanceToPlain(task));
    }

    async deleteTask(id: number) {
        const result = await this.taskRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
    }

    async getTasksByAssignee(userId: number) {
        const tasks = await this.taskRepository.find({
            where: { assignees: { id: userId } },
            relations: ['assignees'],
        });
        return instanceToPlain(tasks);
    }
}