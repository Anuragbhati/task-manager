import { Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamRepository: Repository<Team>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createTeam(createTeamDto: { name: string; description?: string }) {
        const team = this.teamRepository.create(createTeamDto);
        const savedTeam = await this.teamRepository.save(team);
        return instanceToPlain(savedTeam);
    }

    async getAllTeams() {
        const teams = await this.teamRepository.find({
            relations: ['members'],
        });
        return instanceToPlain(teams);
    }

    async getTeamById(id: number) {
        const team = await this.teamRepository.findOne({
            where: { id },
            relations: ['members'],
        });

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return instanceToPlain(team);
    }

    async updateTeam(
        id: number,
        updateTeamDto: { name?: string; description?: string },
    ) {
        const team = await this.getTeamById(id);
        Object.assign(team, updateTeamDto);
        const savedTeam = await this.teamRepository.save(team);
        return instanceToPlain(savedTeam);
    }

    async deleteTeam(id: number) {
        const result = await this.teamRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addMemberToTeam(teamId: number, userId: number) {
        const team = await this.getTeamById(teamId) as Team
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.team = team;
        await this.userRepository.save(user);
        return instanceToPlain(team);
    }

    async addMembersToTeam(teamId: number, userIds: number[]) {
        let team = (await this.getTeamById(teamId)) as Team
        const users = await this.userRepository.findBy({ id: In(userIds) });

        if (users.length !== userIds.length) {
            const foundIds = users.map(user => user.id);
            const missingIds = userIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Users with IDs ${missingIds.join(', ')} not found`);
        }

        await Promise.all(users.map(user => {
            user.team = team;
            return this.userRepository.save(user);
        }));

        return instanceToPlain(team);
    }

    async removeMemberFromTeam(teamId: number, userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['team'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (user.team?.id !== teamId) {
            throw new NotFoundException(`User with ID ${userId} is not a member of team ${teamId}`);
        }

        user.team = null;
        await this.userRepository.save(user);
        const team = await this.getTeamById(teamId);
        return instanceToPlain(team);
    }
}