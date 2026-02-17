import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { WatchList } from "./watch-list.entity";

/** Membership of a user in a watch list with role. WT-020, WT-023: owner vs member.
 *  Table name is watch_list_memberships to avoid conflict with the old ManyToMany join table "watch_list_members". */
@Entity({ name: "watch_list_memberships" })
@Unique(["watchListId", "userId"])
export class WatchListMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    watchListId: number;

    @ManyToOne(() => WatchList, (list) => list.watchListMembers, { onDelete: "CASCADE" })
    watchList: WatchList;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.watchListMembers, { onDelete: "CASCADE" })
    user: User;

    @Column({ type: "varchar", length: 20, default: "member" })
    role: "owner" | "member";
}
