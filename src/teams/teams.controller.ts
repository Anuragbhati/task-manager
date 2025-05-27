import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    create(@Body() createTeamDto: { name: string; description?: string }) {
        return this.teamsService.createTeam(createTeamDto);
    }

    @Get()
    findAll() {
        return this.teamsService.getAllTeams();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teamsService.getTeamById(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTeamDto: { name?: string; description?: string },
    ) {
        return this.teamsService.updateTeam(+id, updateTeamDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teamsService.deleteTeam(+id);
    }

    @Post(':id/members/:userId')
    addMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.teamsService.addMemberToTeam(+id, +userId);
    }

    @Post(':id/members')
    addMembers(@Param('id') id: string, @Body() body: { userIds: number[] }) {
        return this.teamsService.addMembersToTeam(+id, body.userIds);
    }

    @Delete(':id/members/:userId')
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.teamsService.removeMemberFromTeam(+id, +userId);
    }
}