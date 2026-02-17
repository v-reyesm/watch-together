import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Media } from "../../media/entities/media.entity";
import { WatchEvent } from "./watch-event.entity";
import { WatchListMember } from "./watch-list-member.entity";

@Entity({ name: "watch_lists" })
export class WatchList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => WatchListMember, (m) => m.watchList)
    watchListMembers: WatchListMember[];

    @ManyToMany(() => Media)
    @JoinTable()
    items: Media[];

    @OneToMany(() => WatchEvent, (e) => e.watchList)
    watchEvents: WatchEvent[];
}
