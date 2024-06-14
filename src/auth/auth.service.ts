import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { jwtSecret } from './utils/constants';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {

  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async signup(dto: AuthDto) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (foundUser)
      throw new BadRequestException('Email already exists');

    const hashedPassword = await this.hashPassword(password);

    await this.prisma.user.create({
      data: {
        email,
        hashedPassword
      }
    })

    return { message: 'signup was succefull' };
  }

  async signin(dto: AuthDto, req: Request, res: Response) {

    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (!foundUser)
      throw new BadRequestException('Wrong credentials');

    const isMatch = await this.comparePasswords({ password, hash: foundUser.hashedPassword });

    if (!isMatch)
      throw new BadRequestException('Wrong credentials');

    //sign jwt and return to the user
    const token = await this.signToken({ id: foundUser.id, email: foundUser.email });

    if (!token)
      throw new ForbiddenException();

    res.cookie('token', token);

    return res.send({ message: 'Logged in succesfully' });
  }

  async signout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.send({ message: 'Logged out succesfully' });
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }

  async comparePasswords(args: { password: string, hash: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signToken(args: { id: string, email: string }) {
    const payload = args;
    return this.jwtService.signAsync(payload, { secret: jwtSecret })
  }
}
