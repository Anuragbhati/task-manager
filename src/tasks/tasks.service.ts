import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        assigneeId?: number;
    }) {
        if (typeof createTaskDto.dueDate === 'string') {
            createTaskDto.dueDate = new Date(createTaskDto.dueDate);
        }
        const task = this.taskRepository.create({
            ...createTaskDto,
            status: TaskStatus.TODO,
        });

        if (createTaskDto.assigneeId) {
            const assignee = await this.userRepository.findOne({
                where: { id: createTaskDto.assigneeId },
            });
            if (!assignee) {
                throw new NotFoundException(`User with ID ${createTaskDto.assigneeId} not found`);
            }
            task.assignee = assignee;
        }

        return this.taskRepository.save(task);
    }

    async getAllTasks() {
        return this.taskRepository.find({
            relations: ['assignee'],
        });
    }

    async getTaskById(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['assignee'],
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
            assigneeId?: number;
        },
    ) {
        const task = await this.getTaskById(id);

        if (updateTaskDto.assigneeId) {
            const assignee = await this.userRepository.findOne({
                where: { id: updateTaskDto.assigneeId },
            });
            if (!assignee) {
                throw new NotFoundException(`User with ID ${updateTaskDto.assigneeId} not found`);
            }
            task.assignee = assignee;
            delete updateTaskDto.assigneeId;
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
        const task = await this.taskRepository.find({
            where: { assignee: { id: userId } },
            relations: ['assignee'],
        });
        return instanceToPlain(task);
    }
}