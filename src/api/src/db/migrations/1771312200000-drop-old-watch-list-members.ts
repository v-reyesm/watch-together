import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Drops the legacy watch_list_members table (old ManyToMany join).
 * The model uses watch_list_memberships (WatchListMember entity) only.
 */
export class DropOldWatchListMembers1771312200000 implements MigrationInterface {
  name = "DropOldWatchListMembers1771312200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "watch_list_members" DROP CONSTRAINT "FK_3fd3faf1d2b394492cc6e9dc497"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watch_list_members" DROP CONSTRAINT "FK_fbacf55d6b194d10866a54af14a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3fd3faf1d2b394492cc6e9dc49"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbacf55d6b194d10866a54af14"`,
    );
    await queryRunner.query(`DROP TABLE "watch_list_members"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "watch_list_members" ("watchListsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_194d893611cbda7661c7aa1b5e7" PRIMARY KEY ("watchListsId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbacf55d6b194d10866a54af14" ON "watch_list_members" ("watchListsId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3fd3faf1d2b394492cc6e9dc49" ON "watch_list_members" ("usersId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "watch_list_members" ADD CONSTRAINT "FK_fbacf55d6b194d10866a54af14a" FOREIGN KEY ("watchListsId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "watch_list_members" ADD CONSTRAINT "FK_3fd3faf1d2b394492cc6e9dc497" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
