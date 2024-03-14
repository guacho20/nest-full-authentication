import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signup() {
    return 'signup route';
  }

  @Post('signin')
  signin() {
    return 'signin route';
  }

  @Get('signout')
  signout() {
    return 'signout route';
  }

}
