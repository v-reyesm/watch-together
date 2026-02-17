import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWatchlistUserRelationship1771312085324 implements MigrationInterface {
    name = 'FixWatchlistUserRelationship1771312085324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "watch_events" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "mediaId" integer NOT NULL, "watchListId" integer NOT NULL, "watchedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_37a62c61f1b21e22f7513e03247" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_list_memberships" ("id" SERIAL NOT NULL, "watchListId" integer NOT NULL, "userId" integer NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'member', CONSTRAINT "UQ_adcbc3c1b4a07e3cba777b5df83" UNIQUE ("watchListId", "userId"), CONSTRAINT "PK_346334f2f4e0e6b03861b8662ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invites" ("id" SERIAL NOT NULL, "watchListId" integer NOT NULL, "createdById" integer NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "usedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_18a9a6c85f7cc6f42ebef3b3188" UNIQUE ("token"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_98aee780f1ed7c9e5e458b8dc53" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_e16139fea8edb51cd07ad74b9fd" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_1bb99fb47b0902c7fdf51f04a49" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" ADD CONSTRAINT "FK_d6f243b2f87694b87357217cdd0" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" ADD CONSTRAINT "FK_59255028acd21ef91a527d89f37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invites" ADD CONSTRAINT "FK_443732cea6e9db5c85b32af3b3e" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invites" ADD CONSTRAINT "FK_5443fd9ee41280475095b6157eb" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "FK_5443fd9ee41280475095b6157eb"`);
        await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "FK_443732cea6e9db5c85b32af3b3e"`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" DROP CONSTRAINT "FK_59255028acd21ef91a527d89f37"`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" DROP CONSTRAINT "FK_d6f243b2f87694b87357217cdd0"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_1bb99fb47b0902c7fdf51f04a49"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_e16139fea8edb51cd07ad74b9fd"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_98aee780f1ed7c9e5e458b8dc53"`);
        await queryRunner.query(`DROP TABLE "invites"`);
        await queryRunner.query(`DROP TABLE "watch_list_memberships"`);
        await queryRunner.query(`DROP TABLE "watch_events"`);
    }

}
