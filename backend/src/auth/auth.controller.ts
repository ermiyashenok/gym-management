import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /** POST /auth/login */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** POST /auth/register  – JWT required; only SuperAdmin/Owner */
  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  register(@Body() dto: RegisterDto, @Request() req) {
    return this.auth.register(dto, req.user);
  }
}
