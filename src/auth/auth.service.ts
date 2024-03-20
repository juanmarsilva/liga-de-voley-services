import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities';
import { JwtPayload } from './interfaces';
import { LoginUserDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * The function creates a new user, hashes the password, saves the user to the database, removes
     * the password from the user object, and returns the user data along with a JWT token.
     * @param {CreateUserDto} createUserDto - The `createUserDto` parameter in the `create` function is
     * an object that contains the data needed to create a new user. It likely includes properties such
     * as `username`, `email`, and `password`. The function extracts the `password` from the
     * `createUserDto`, hashes it using
     * @returns The `create` method is returning a user object with the password removed and a token
     * added. The token is generated using the `getJwtToken` method with the user's id.
     */
    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            await this.userRepository.save(user);

            delete user.password;

            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            this.handleDbErrors(error);
        }
    }

    /**
     * The function logIn asynchronously authenticates a user by comparing the provided email and
     * password with the stored credentials in the database and returns the user data along with a JWT
     * token if successful.
     * @param {LoginUserDto} loginUserDto - The `loginUserDto` parameter is an object that contains the
     * user's email and password. It is used to authenticate a user during the login process.
     * @returns The `logIn` function is returning an object that includes the user's email, id, and a
     * JWT token. The password is removed from the user object before returning it.
     */
    async logIn(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true },
        });

        if (!user)
            throw new UnauthorizedException('Not valid credentials (email)');

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Not valid credentials (password)');

        delete user.password;

        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    /**
     * The function `getJwtToken` generates a JWT token using the provided payload.
     * @param {JwtPayload} jwtPayload - JwtPayload is an object that contains the payload data to be
     * encoded into a JSON Web Token (JWT). This payload typically includes information such as user
     * details, permissions, and any other relevant data that needs to be securely transmitted and
     * verified.
     * @returns A JWT token is being returned.
     */
    private getJwtToken(jwtPayload: JwtPayload) {
        const token = this.jwtService.sign(jwtPayload);
        return token;
    }

    /**
     * The function handles database errors by checking the error code and throwing appropriate
     * exceptions.
     * @param {any} error - The error parameter is of type "any", which means it can be any type of
     * error object.
     */
    private handleDbErrors(error: any): never {
        if (error.code === '23505') throw new BadRequestException(error.detail);

        console.log(error);

        throw new InternalServerErrorException('Please check server logs');
    }
}
