import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Makes watch_events.watchListId nullable so events can represent "watched alone" (no list).
 */
export class WatchEventOptionalList1771312300000 implements MigrationInterface {
  name = "WatchEventOptionalList1771312300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "watch_events" ALTER COLUMN "watchListId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "watch_events" ALTER COLUMN "watchListId" SET NOT NULL`,
    );
  }
}
