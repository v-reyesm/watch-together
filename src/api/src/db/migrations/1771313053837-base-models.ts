import { MigrationInterface, QueryRunner } from "typeorm";

export class BaseModels1771313053837 implements MigrationInterface {
    name = 'BaseModels1771313053837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "streaming_provider" ("id" integer NOT NULL, "name" character varying NOT NULL, "logoBase64" text NOT NULL, CONSTRAINT "PK_f6be10b46c3b4b8a035957dd6f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movies" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "director" character varying NOT NULL, "runtimeInMinutes" integer NOT NULL, CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tv_series" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "posterUrl" character varying NOT NULL, "overview" character varying NOT NULL, "genres" character varying NOT NULL, "originalLanguage" character varying NOT NULL, "rating" integer NOT NULL, "tmdbId" integer NOT NULL, "imdbId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "numberOfSeasons" integer NOT NULL, "numberOfEpisodes" integer NOT NULL, "totalRuntimeInMinutes" integer NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_41a28f1265fb124488a045e2f69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_events" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "mediaId" integer NOT NULL, "watchListId" integer, "watchedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_37a62c61f1b21e22f7513e03247" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_lists" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_13187320a8e7500e63da8c5888d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_list_memberships" ("id" SERIAL NOT NULL, "watchListId" integer NOT NULL, "userId" integer NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'member', CONSTRAINT "UQ_adcbc3c1b4a07e3cba777b5df83" UNIQUE ("watchListId", "userId"), CONSTRAINT "PK_346334f2f4e0e6b03861b8662ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying, "name" character varying NOT NULL, "avatarUrl" character varying, "googleId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invites" ("id" SERIAL NOT NULL, "watchListId" integer NOT NULL, "createdById" integer NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "usedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_18a9a6c85f7cc6f42ebef3b3188" UNIQUE ("token"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media_providers_streaming_provider" ("mediaId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_d7e7b543e30435cc40659577e7b" PRIMARY KEY ("mediaId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d74b1dd659648830f691be10f0" ON "media_providers_streaming_provider" ("mediaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef9d5a07d386dd3a87f7ee3d7d" ON "media_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE TABLE "movies_providers_streaming_provider" ("moviesId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_06e1a711b947b8958eec7f7e7b5" PRIMARY KEY ("moviesId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f56fe67bade43ac5768d206e4d" ON "movies_providers_streaming_provider" ("moviesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb34c91b3c364a77c740940eaa" ON "movies_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE TABLE "tv_series_providers_streaming_provider" ("tvSeriesId" integer NOT NULL, "streamingProviderId" integer NOT NULL, CONSTRAINT "PK_544b57c3a73baf7790f4ccb9b83" PRIMARY KEY ("tvSeriesId", "streamingProviderId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3c5bb0e71746e425452f7f806" ON "tv_series_providers_streaming_provider" ("tvSeriesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d858f0831a52c4929f976e3a7" ON "tv_series_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE TABLE "watch_lists_items_media" ("watchListsId" integer NOT NULL, "mediaId" integer NOT NULL, CONSTRAINT "PK_41ecba4b5c9c5a039478dcecd81" PRIMARY KEY ("watchListsId", "mediaId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d2e529c563b3880420be6a4de0" ON "watch_lists_items_media" ("watchListsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e881990106cfb19b5202443656" ON "watch_lists_items_media" ("mediaId") `);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_98aee780f1ed7c9e5e458b8dc53" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_e16139fea8edb51cd07ad74b9fd" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_events" ADD CONSTRAINT "FK_1bb99fb47b0902c7fdf51f04a49" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" ADD CONSTRAINT "FK_d6f243b2f87694b87357217cdd0" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" ADD CONSTRAINT "FK_59255028acd21ef91a527d89f37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invites" ADD CONSTRAINT "FK_443732cea6e9db5c85b32af3b3e" FOREIGN KEY ("watchListId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invites" ADD CONSTRAINT "FK_5443fd9ee41280475095b6157eb" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" ADD CONSTRAINT "FK_d74b1dd659648830f691be10f02" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" ADD CONSTRAINT "FK_ef9d5a07d386dd3a87f7ee3d7d5" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_f56fe67bade43ac5768d206e4da" FOREIGN KEY ("moviesId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_fb34c91b3c364a77c740940eaa1" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_b3c5bb0e71746e425452f7f806c" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_3d858f0831a52c4929f976e3a7b" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" ADD CONSTRAINT "FK_d2e529c563b3880420be6a4de06" FOREIGN KEY ("watchListsId") REFERENCES "watch_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" ADD CONSTRAINT "FK_e881990106cfb19b52024436569" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" DROP CONSTRAINT "FK_e881990106cfb19b52024436569"`);
        await queryRunner.query(`ALTER TABLE "watch_lists_items_media" DROP CONSTRAINT "FK_d2e529c563b3880420be6a4de06"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_3d858f0831a52c4929f976e3a7b"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_b3c5bb0e71746e425452f7f806c"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_fb34c91b3c364a77c740940eaa1"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_f56fe67bade43ac5768d206e4da"`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" DROP CONSTRAINT "FK_ef9d5a07d386dd3a87f7ee3d7d5"`);
        await queryRunner.query(`ALTER TABLE "media_providers_streaming_provider" DROP CONSTRAINT "FK_d74b1dd659648830f691be10f02"`);
        await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "FK_5443fd9ee41280475095b6157eb"`);
        await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "FK_443732cea6e9db5c85b32af3b3e"`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" DROP CONSTRAINT "FK_59255028acd21ef91a527d89f37"`);
        await queryRunner.query(`ALTER TABLE "watch_list_memberships" DROP CONSTRAINT "FK_d6f243b2f87694b87357217cdd0"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_1bb99fb47b0902c7fdf51f04a49"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_e16139fea8edb51cd07ad74b9fd"`);
        await queryRunner.query(`ALTER TABLE "watch_events" DROP CONSTRAINT "FK_98aee780f1ed7c9e5e458b8dc53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e881990106cfb19b5202443656"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2e529c563b3880420be6a4de0"`);
        await queryRunner.query(`DROP TABLE "watch_lists_items_media"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d858f0831a52c4929f976e3a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3c5bb0e71746e425452f7f806"`);
        await queryRunner.query(`DROP TABLE "tv_series_providers_streaming_provider"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb34c91b3c364a77c740940eaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f56fe67bade43ac5768d206e4d"`);
        await queryRunner.query(`DROP TABLE "movies_providers_streaming_provider"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef9d5a07d386dd3a87f7ee3d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d74b1dd659648830f691be10f0"`);
        await queryRunner.query(`DROP TABLE "media_providers_streaming_provider"`);
        await queryRunner.query(`DROP TABLE "invites"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "watch_list_memberships"`);
        await queryRunner.query(`DROP TABLE "watch_lists"`);
        await queryRunner.query(`DROP TABLE "watch_events"`);
        await queryRunner.query(`DROP TABLE "tv_series"`);
        await queryRunner.query(`DROP TABLE "movies"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "streaming_provider"`);
    }

}
