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
import {
  UpdateUserDTO,
  UpdateUserSchema,
  UserDTO,
  UserSchema,
} from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    try {
      return this.userService.getAllUsers();
    } catch (error) {
      throw new HttpException(`Error fetching users: ${error}`, 500);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.userService.getUserById(id);

      if (user) return user;

      throw new HttpException('User not found', 404);
    } catch (error) {
      throw new HttpException(`Error fetching user: ${error}`, 500);
    }
  }

  @Post()
  @UsePipes(new ZodValidationPipe(UserSchema))
  async createUser(@Body() data: UserDTO): Promise<User> {
    const userExists = await this.userService.getUserByEmail(data.email);

    if (userExists) throw new HttpException('User already exists', 400);

    const hashedPassword = await hash(data.password, 6);

    const userHashed = {
      ...data,
      password: hashedPassword,
    };

    try {
      return this.userService.createUser(userHashed);
    } catch (error) {
      throw new HttpException(`Error creating user: ${error}`, 500);
    }
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserDTO,
  ): Promise<User> {
    try {
      const user = await this.userService.getUserById(id);

      if (!user) throw new HttpException('User not found', 404);

      if (data.email) {
        const userExists = await this.userService.getUserByEmail(data.email);

        if (userExists) throw new HttpException('Email already in use', 404);
      }

      if (data.password) {
        const hashedPassword = await hash(data.password, 6);

        data = {
          ...data,
          password: hashedPassword,
        };

        return this.userService.updateUser(id, data);
      }

      return this.userService.updateUser(id, data);
    } catch (error) {
      throw new HttpException(`Error updating user: ${error}`, 500);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    try {
      return this.userService.deleteUser(id);
    } catch (error) {
      throw new HttpException(`Error deleting user: ${error}`, 500);
    }
  }
}
