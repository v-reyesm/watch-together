import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { WatchListMember } from "../../watch-list/entities/watch-list-member.entity";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /** Unique per account. Used for both email/password and Google logins. */
    @Column({ unique: true })
    email: string;

    /** Set only for email/password (or when user sets a password). Null for Google-only users. */
    @Column({ type: "varchar", nullable: true, select: false })
    passwordHash: string | null;

    @Column()
    name: string;

    /** Profile picture URL (e.g. from Google). Optional. */
    @Column({ type: "varchar", nullable: true })
    avatarUrl: string | null;

    /** Google OAuth subject id (sub). Unique when set; null for email/password–only users. */
    @Column({ type: "varchar", nullable: true, unique: true })
    googleId: string | null;

    @OneToMany(() => WatchListMember, (m) => m.user)
    watchListMembers: WatchListMember[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
