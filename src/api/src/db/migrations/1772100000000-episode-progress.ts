import { MigrationInterface, QueryRunner } from 'typeorm';

export class EpisodeProgress1772100000000 implements MigrationInterface {
  name = 'EpisodeProgress1772100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "episode_progress" (
        "id" SERIAL NOT NULL,
        "watchListId" integer NOT NULL,
        "mediaId" integer NOT NULL,
        "watchedEpisodes" integer NOT NULL DEFAULT 0,
        "watchedSeasons" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_episode_progress" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_episode_progress_list_media" UNIQUE ("watchListId", "mediaId"),
        CONSTRAINT "FK_episode_progress_watchList" FOREIGN KEY ("watchListId")
          REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_episode_progress_media" FOREIGN KEY ("mediaId")
          REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "episode_progress"`);
  }
}
