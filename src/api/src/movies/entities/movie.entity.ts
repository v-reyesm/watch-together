import { Column, Entity } from "typeorm";
import { Media } from "../../media/entities/media.entity";

@Entity({ name: "movies" })
export class Movie extends Media {
    @Column()
    director: string;

    @Column()
    runtimeInMinutes: number;
}
