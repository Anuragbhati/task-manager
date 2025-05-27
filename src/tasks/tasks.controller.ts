import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskStatus } from './entities/task.entity';
import { instanceToPlain } from 'class-transformer';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: {
        title: string;
        description: string;
        dueDate: Date;
        assigneeIds?: number[];
    }) {
        return this.tasksService.createTask(createTaskDto);
    }

    @Post('bulk')
    createMultiple(@Body() createTasksDto: {
        title: string;
        description: string;
        dueDate: Date;
        assigneeIds?: number[];
    }[]) {
        return Promise.all(createTasksDto.map(taskDto => this.tasksService.createTask(taskDto)));
    }

    @Get()
    async findAll() {
        const tasks = await this.tasksService.getAllTasks();
        return instanceToPlain(tasks);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.getTaskById(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTaskDto: {
            title?: string;
            description?: string;
            dueDate?: Date;
            status?: TaskStatus;
            assigneeIds?: number[];
        },
    ) {
        return this.tasksService.updateTask(+id, updateTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.deleteTask(+id);
    }

    @Get('user/:userId')
    findByAssignee(@Param('userId') userId: string) {
        return this.tasksService.getTasksByAssignee(+userId);
    }
}