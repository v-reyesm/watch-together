import { PartialType } from '@nestjs/swagger';
import { CreateWatchListDto } from './create-watch-list.dto';

export class UpdateWatchListDto extends PartialType(CreateWatchListDto) {}
