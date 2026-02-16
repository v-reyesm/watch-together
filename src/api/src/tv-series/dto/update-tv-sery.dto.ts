import { PartialType } from '@nestjs/swagger';
import { CreateTvSeryDto } from './create-tv-sery.dto';

export class UpdateTvSeryDto extends PartialType(CreateTvSeryDto) {}
