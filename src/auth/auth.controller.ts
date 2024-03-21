import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { CreateUserDto, LoginUserDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * The function creates a new user using the provided data from the createUserDto object.
     * @param {CreateUserDto} createUserDto - The `createUserDto` parameter in the `create` method is
     * of type `CreateUserDto`. It is likely an object that contains the data needed to create a new
     * user, such as username, password, email, etc. This parameter is received through the request
     * body when the `create`
     * @returns The `create` method is returning the result of calling the `create` method of the
     * `authService` with the `createUserDto` as an argument.
     */
    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    /**
     * The login function in TypeScript takes a loginUserDto object as input and calls the logIn method
     * of the authService.
     * @param {LoginUserDto} loginUserDto - The `loginUserDto` parameter in the `login` function is of
     * type `LoginUserDto`. It is being passed as the body of the request when a user attempts to log
     * in. This parameter likely contains the user's login credentials such as username and password
     * for authentication. The `login`
     * @returns The `login` method is returning the result of calling the `logIn` method from the
     * `authService` with the `loginUserDto` parameter passed to it.
     */
    @Post('login')
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.logIn(loginUserDto);
    }
}
