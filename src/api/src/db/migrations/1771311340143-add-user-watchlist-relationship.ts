import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserWatchlistRelationship1771311340143 implements MigrationInterface {
    name = 'AddUserWatchlistRelationship1771311340143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "watch_lists" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_13187320a8e7500e63da8c5888d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying, "name" character varying NOT NULL, "avatarUrl" character varying, "googleId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_list_members" ("watchListsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_194d893611cbda7661c7aa1b5e7" PRIMARY KEY ("watchListsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fbacf55d6b194d10866a54af14" ON "watch_list_members" ("watchListsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3fd3faf1d2b394492cc6e9dc49" ON "watch_list_members" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "watch_lists_items_media" ("watchListsId" integer NOT NULL, "mediaId" integer NOT NULL, CONSTRAINT "PK_41ecba4b5c9c5a039478dcecd81" PRIMARY KEY ("watchListsId", "mediaId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d2e529c563b3880420be6a4de0" ON "watch_lists_items_media" ("watchListsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e881990106cfb19b5202443656" ON "watch_lists_items_media" ("mediaId") `);
        await queryRunner.query(`ALTER TABLE "watch_list_members" ADD CONSTRAINT "FK_fbacf55d6b194d10866a54af14a" FOREIGN KEY ("watchListsId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "watch_list_members" ADD CONSTRAINT "FK_3fd3faf1d2b394492cc6e9dc497" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" ADD CONSTRAINT "FK_d2e529c563b3880420be6a4de06" FOREIGN KEY ("watchListsId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" ADD CONSTRAINT "FK_e881990106cfb19b52024436569" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" DROP CONSTRAINT "FK_e881990106cfb19b52024436569"`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" DROP CONSTRAINT "FK_d2e529c563b3880420be6a4de06"`);
        await queryRunner.query(`ALTER TABLE "watch_list_members" DROP CONSTRAINT "FK_3fd3faf1d2b394492cc6e9dc497"`);
        await queryRunner.query(`ALTER TABLE "watch_list_members" DROP CONSTRAINT "FK_fbacf55d6b194d10866a54af14a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e881990106cfb19b5202443656"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2e529c563b3880420be6a4de0"`);
        await queryRunner.query(`DROP TABLE "watch_lists_items_media"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fd3faf1d2b394492cc6e9dc49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbacf55d6b194d10866a54af14"`);
        await queryRunner.query(`DROP TABLE "watch_list_members"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "watch_lists"`);
    }

}
