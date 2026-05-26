import { MigrationInterface, QueryRunner } from 'typeorm';

export class Wt120123ListItems1772000000000 implements MigrationInterface {
  name = 'Wt120123ListItems1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" ADD "providerName" character varying(30) NOT NULL DEFAULT 'tmdb'`,
    );
    await queryRunner.query(`ALTER TABLE "media" ADD "providerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "media" ADD "mediaType" character varying(20) NOT NULL DEFAULT 'movie'`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "providerName" character varying(30) NOT NULL DEFAULT 'tmdb'`,
    );
    await queryRunner.query(`ALTER TABLE "movies" ADD "providerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "mediaType" character varying(20) NOT NULL DEFAULT 'movie'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ADD "providerName" character varying(30) NOT NULL DEFAULT 'tmdb'`,
    );
    await queryRunner.query(`ALTER TABLE "tv_series" ADD "providerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "tv_series" ADD "mediaType" character varying(20) NOT NULL DEFAULT 'tv'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_media_provider_identity" ON "media" ("providerName", "providerId") WHERE "providerId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_media_provider_identity"`,
    );
    await queryRunner.query(`ALTER TABLE "tv_series" DROP COLUMN "mediaType"`);
    await queryRunner.query(`ALTER TABLE "tv_series" DROP COLUMN "providerId"`);
    await queryRunner.query(
      `ALTER TABLE "tv_series" DROP COLUMN "providerName"`,
    );
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "mediaType"`);
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "providerId"`);
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "providerName"`);
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "mediaType"`);
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "providerId"`);
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "providerName"`);
  }
}
