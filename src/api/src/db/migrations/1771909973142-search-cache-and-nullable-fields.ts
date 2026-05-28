import { MigrationInterface, QueryRunner } from 'typeorm';

export class SearchCacheAndNullableFields1771909973142
  implements MigrationInterface
{
  name = 'SearchCacheAndNullableFields1771909973142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tmdb_search_cache" ("id" SERIAL NOT NULL, "query" character varying NOT NULL, "page" integer NOT NULL, "searchType" character varying(10) NOT NULL, "mediaIds" integer array NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_14440a52d9be4151568b8a33f93" UNIQUE ("query", "page", "searchType"), CONSTRAINT "PK_9b7f485bb0bd89b96c8e2d94b11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "director" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "runtimeInMinutes" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "numberOfSeasons" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "numberOfEpisodes" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "totalRuntimeInMinutes" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "totalRuntimeInMinutes" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "numberOfEpisodes" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "numberOfSeasons" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "runtimeInMinutes" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "director" SET NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "tmdb_search_cache"`);
  }
}
