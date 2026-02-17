import { PartialType } from '@nestjs/mapped-types';
import { CreateWatchListDto } from './create-watch-list.dto';

export class UpdateWatchListDto extends PartialType(CreateWatchListDto) {}
