import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGenres1771481605032 implements MigrationInterface {
  name = 'CreateGenres1771481605032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "genres" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "tmdbId" integer NOT NULL, CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media_genres_genres" ("mediaId" integer NOT NULL, "genresId" integer NOT NULL, CONSTRAINT "PK_35a870a711ad25f3f04fcc4cf0a" PRIMARY KEY ("mediaId", "genresId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a858b45b5d74167a3760883ad1" ON "media_genres_genres" ("mediaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a85154791468ebce2bb511b377" ON "media_genres_genres" ("genresId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "movies_genres_genres" ("moviesId" integer NOT NULL, "genresId" integer NOT NULL, CONSTRAINT "PK_59537f354fd4a79606cc4f3cf1b" PRIMARY KEY ("moviesId", "genresId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb43556a8849221b82cd17461c" ON "movies_genres_genres" ("moviesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccf6c10277da37e9fc265863fa" ON "movies_genres_genres" ("genresId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tv_series_genres_genres" ("tvSeriesId" integer NOT NULL, "genresId" integer NOT NULL, CONSTRAINT "PK_21ea1af2253cd743c38c5c97489" PRIMARY KEY ("tvSeriesId", "genresId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ce1e0362b6b07dbb73ad631bf" ON "tv_series_genres_genres" ("tvSeriesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb7386edbac34c701e557b12e0" ON "tv_series_genres_genres" ("genresId") `,
    );
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "genres"`);
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "genres"`);
    await queryRunner.query(`ALTER TABLE "tv_series" DROP COLUMN "genres"`);
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "originalLanguage" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "media" ADD "rating" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "tmdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "imdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "originalLanguage" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "rating" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "tmdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "imdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "originalLanguage" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tv_series" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "tv_series" ADD "rating" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "tmdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "imdbId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genres" ADD CONSTRAINT "FK_a858b45b5d74167a3760883ad16" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genres" ADD CONSTRAINT "FK_a85154791468ebce2bb511b3776" FOREIGN KEY ("genresId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies_genres_genres" ADD CONSTRAINT "FK_cb43556a8849221b82cd17461c8" FOREIGN KEY ("moviesId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies_genres_genres" ADD CONSTRAINT "FK_ccf6c10277da37e9fc265863fab" FOREIGN KEY ("genresId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series_genres_genres" ADD CONSTRAINT "FK_9ce1e0362b6b07dbb73ad631bf7" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series_genres_genres" ADD CONSTRAINT "FK_fb7386edbac34c701e557b12e03" FOREIGN KEY ("genresId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tv_series_genres_genres" DROP CONSTRAINT "FK_fb7386edbac34c701e557b12e03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series_genres_genres" DROP CONSTRAINT "FK_9ce1e0362b6b07dbb73ad631bf7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies_genres_genres" DROP CONSTRAINT "FK_ccf6c10277da37e9fc265863fab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies_genres_genres" DROP CONSTRAINT "FK_cb43556a8849221b82cd17461c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genres" DROP CONSTRAINT "FK_a85154791468ebce2bb511b3776"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_genres_genres" DROP CONSTRAINT "FK_a858b45b5d74167a3760883ad16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "imdbId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "tmdbId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tv_series" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "tv_series" ADD "rating" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ALTER COLUMN "originalLanguage" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "imdbId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "tmdbId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "rating" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "originalLanguage" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "imdbId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "tmdbId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "media" ADD "rating" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ALTER COLUMN "originalLanguage" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tv_series" ADD "genres" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "genres" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD "genres" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb7386edbac34c701e557b12e0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ce1e0362b6b07dbb73ad631bf"`,
    );
    await queryRunner.query(`DROP TABLE "tv_series_genres_genres"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ccf6c10277da37e9fc265863fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb43556a8849221b82cd17461c"`,
    );
    await queryRunner.query(`DROP TABLE "movies_genres_genres"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a85154791468ebce2bb511b377"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a858b45b5d74167a3760883ad1"`,
    );
    await queryRunner.query(`DROP TABLE "media_genres_genres"`);
    await queryRunner.query(`DROP TABLE "genres"`);
  }
}
