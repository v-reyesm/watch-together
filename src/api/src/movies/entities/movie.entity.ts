import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    translatedTitle: string;

    @Column()
    releaseDate: Date;

    @Column()
    runtimeInMinutes: number;

    @Column()
    posterUrl: string;

    @Column()
    imdbId: string;

    @Column()
    tmdbId: number;

    @Column()
    overview: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

}




