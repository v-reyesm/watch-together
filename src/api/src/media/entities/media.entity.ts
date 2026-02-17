import { StreamingProvider } from "../../streaming-providers/entities/streaming-provider.entity";
import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Media {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    translatedTitle: string;

    @Column()
    releaseDate: Date;

    @Column()
    posterUrl: string;

    @Column()
    overview: string;

    @Column()
    genres?: string;

    @Column()
    originalLanguage?: string;

    @Column()
    rating?: number;

    @Column()
    tmdbId?: number;

    @Column()
    imdbId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => StreamingProvider)
    @JoinTable()
    providers: StreamingProvider[];

}
