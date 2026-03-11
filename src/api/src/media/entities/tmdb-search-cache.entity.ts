import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: "tmdb_search_cache" })
@Unique(["query", "page", "searchType"])
export class TmdbSearchCache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    query: string;

    @Column()
    page: number;

    @Column({ type: "varchar", length: 10 })
    searchType: "movie" | "tv";

    @Column({ type: "int", array: true })
    mediaIds: number[];

    @CreateDateColumn()
    createdAt: Date;
}
