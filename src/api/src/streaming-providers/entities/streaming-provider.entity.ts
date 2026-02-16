import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class StreamingProvider {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text' })
    logoBase64: string;
}
