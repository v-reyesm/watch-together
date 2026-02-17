import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1771300846281 implements MigrationInterface {
    name = 'FirstMigration1771300846281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "streaming_provider" ("id" integer NOT NULL, "name" character varying NOT NULL, "logoBase64" text NOT NULL, CONSTRAINT "PK_f6be10b46c3b4b8a035957dd6f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movie" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "director" character varying NOT NULL, "runtimeInMinutes" integer NOT NULL, CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tv_serie" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "numberOfSeasons" integer NOT NULL, "numberOfEpisodes" integer NOT NULL, "totalRuntimeInMinutes" integer NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_47c1714cac6f9abfca49282622e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media_providers_streaming_provider" ("mediaId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_d7e7b543e30435cc40659577e7b" PRIMARY KEY ("mediaId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d74b1dd659648830f691be10f0" ON "media_providers_streaming_provider" ("mediaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef9d5a07d386dd3a87f7ee3d7d" ON "media_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE TABLE "movie_providers_streaming_provider" ("movieId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_610b89a98ecc16f37118a0f56e7" PRIMARY KEY ("movieId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e15290faa67a8bd39bbf0ed7e" ON "movie_providers_streaming_provider" ("movieId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3870df294212b069d35270aa4" ON "movie_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE TABLE "tv_serie_providers_streaming_provider" ("tvSerieId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_29b6bd869939dc91c8e7c015e4f" PRIMARY KEY ("tvSerieId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c74ccb2e3a6e6479b847d69e8" ON "tv_serie_providers_streaming_provider" ("tvSerieId") `);
        await queryRunner.query(`CREATE INDEX "IDX_633e5c1b736bea9c47845e6916" ON "tv_serie_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" ADD CONSTRAINT "FK_d74b1dd659648830f691be10f02" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" ADD CONSTRAINT "FK_ef9d5a07d386dd3a87f7ee3d7d5" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movie_providers_streaming_provider" ADD CONSTRAINT "FK_4e15290faa67a8bd39bbf0ed7ee" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movie_providers_streaming_provider" ADD CONSTRAINT "FK_e3870df294212b069d35270aa46" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_serie_providers_streaming_provider" ADD CONSTRAINT "FK_3c74ccb2e3a6e6479b847d69e8d" FOREIGN KEY ("tvSerieId") REFERENCES "tv_serie"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_serie_providers_streaming_provider" ADD CONSTRAINT "FK_633e5c1b736bea9c47845e69164" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tv_serie_providers_streaming_provider" DROP CONSTRAINT "FK_633e5c1b736bea9c47845e69164"`);
        await queryRunner.query(`ALTER TABLE "tv_serie_providers_streaming_provider" DROP CONSTRAINT "FK_3c74ccb2e3a6e6479b847d69e8d"`);
        await queryRunner.query(`ALTER TABLE "movie_providers_streaming_provider" DROP CONSTRAINT "FK_e3870df294212b069d35270aa46"`);
        await queryRunner.query(`ALTER TABLE "movie_providers_streaming_provider" DROP CONSTRAINT "FK_4e15290faa67a8bd39bbf0ed7ee"`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" DROP CONSTRAINT "FK_ef9d5a07d386dd3a87f7ee3d7d5"`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" DROP CONSTRAINT "FK_d74b1dd659648830f691be10f02"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_633e5c1b736bea9c47845e6916"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c74ccb2e3a6e6479b847d69e8"`);
        await queryRunner.query(`DROP TABLE "tv_serie_providers_streaming_provider"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3870df294212b069d35270aa4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e15290faa67a8bd39bbf0ed7e"`);
        await queryRunner.query(`DROP TABLE "movie_providers_streaming_provider"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef9d5a07d386dd3a87f7ee3d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d74b1dd659648830f691be10f0"`);
        await queryRunner.query(`DROP TABLE "media_providers_streaming_provider"`);
        await queryRunner.query(`DROP TABLE "tv_serie"`);
        await queryRunner.query(`DROP TABLE "movie"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "streaming_provider"`);
    }

}
