import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { hash } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { UpdateUserSchema, UserDTO, UserSchema } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    try {
      return this.userService.getAllUsers();
    } catch {
      throw new HttpException('Error fetching users', 500);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return user;
    } catch {
      throw new HttpException('Error fetching user', 500);
    }
  }

  @Post()
  @UsePipes(new ZodValidationPipe(UserSchema))
  async createUser(@Body() data: UserDTO): Promise<User> {
    const userExists = await this.userService.getUserByEmail(data.email);

    if (userExists) {
      throw new HttpException('User already exists', 400);
    }

    const hashedPassword = await hash(data.password, 6);

    const userHashed = {
      ...data,
      password: hashedPassword,
    };

    try {
      return this.userService.createUser(userHashed);
    } catch {
      throw new HttpException('Error creating user', 500);
    }
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateUser(@Param('id') id: string, @Body() data: User): Promise<User> {
    try {
      return this.userService.updateUser(id, data);
    } catch {
      throw new HttpException('Error updating user', 500);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
