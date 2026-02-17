import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Media } from "../../media/entities/media.entity";
import { User } from "../../users/entities/user.entity";
import { WatchList } from "./watch-list.entity";

/** Record of a user marking something as watched. WT-050: context (alone vs together), linked to list. */
@Entity({ name: "watch_events" })
export class WatchEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;

    @Column()
    mediaId: number;

    @ManyToOne(() => Media, { onDelete: "CASCADE" })
    media: Media;

    /** List context: when set, "watched together" is inferred if multiple users watched in same list. */
    @Column()
    watchListId: number;

    @ManyToOne(() => WatchList, { onDelete: "CASCADE" })
    watchList: WatchList;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    watchedAt: Date;
}
