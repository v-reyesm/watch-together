import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "genres" })
export class Genre {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    tmdbId: number;
}
