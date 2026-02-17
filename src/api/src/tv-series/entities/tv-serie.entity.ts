import { Media } from "../../media/entities/media.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "tv_series" })
export class TvSerie extends Media {
    @Column()
    numberOfSeasons: number;

    @Column()
    numberOfEpisodes: number;

    @Column()
    totalRuntimeInMinutes: number;

    @Column()
    status?: "ongoing" | "ended" | "upcoming" | "cancelled" | "unknown";
}
