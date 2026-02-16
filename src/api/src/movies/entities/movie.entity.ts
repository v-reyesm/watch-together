import { Column, Entity } from "typeorm";
import { Media } from "src/media/entities/media.entity";

@Entity()
export class Movie extends Media {
    @Column()
    director: string;

    @Column()
    runtimeInMinutes: number;
}
