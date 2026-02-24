import { Genre } from "../../genres/entities/genre.entity";
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

    @ManyToMany(() => Genre)
    @JoinTable()
    genres: Genre[];

    @Column({ nullable: true })
    originalLanguage?: string;

    @Column({ type: 'float', nullable: true })
    rating?: number;

    @Column({ nullable: true })
    tmdbId?: number;

    @Column({ nullable: true })
    imdbId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => StreamingProvider)
    @JoinTable()
    providers: StreamingProvider[];

}
