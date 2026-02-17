import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWatchList1771310494048 implements MigrationInterface {
    name = 'AddWatchList1771310494048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_4e15290faa67a8bd39bbf0ed7ee"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_e3870df294212b069d35270aa46"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_3c74ccb2e3a6e6479b847d69e8d"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_633e5c1b736bea9c47845e69164"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e15290faa67a8bd39bbf0ed7e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3870df294212b069d35270aa4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c74ccb2e3a6e6479b847d69e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_633e5c1b736bea9c47845e6916"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" RENAME COLUMN "movieId" TO "moviesId"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" RENAME COLUMN "tvSerieId" TO "tvSeriesId"`);
        await queryRunner.query(`CREATE INDEX "IDX_f56fe67bade43ac5768d206e4d" ON "movies_providers_streaming_provider" ("moviesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb34c91b3c364a77c740940eaa" ON "movies_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b3c5bb0e71746e425452f7f806" ON "tv_series_providers_streaming_provider" ("tvSeriesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d858f0831a52c4929f976e3a7" ON "tv_series_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_f56fe67bade43ac5768d206e4da" FOREIGN KEY ("moviesId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_fb34c91b3c364a77c740940eaa1" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_b3c5bb0e71746e425452f7f806c" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_3d858f0831a52c4929f976e3a7b" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_3d858f0831a52c4929f976e3a7b"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" DROP CONSTRAINT "FK_b3c5bb0e71746e425452f7f806c"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_fb34c91b3c364a77c740940eaa1"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" DROP CONSTRAINT "FK_f56fe67bade43ac5768d206e4da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d858f0831a52c4929f976e3a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3c5bb0e71746e425452f7f806"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb34c91b3c364a77c740940eaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f56fe67bade43ac5768d206e4d"`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" RENAME COLUMN "tvSeriesId" TO "tvSerieId"`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" RENAME COLUMN "moviesId" TO "movieId"`);
        await queryRunner.query(`CREATE INDEX "IDX_633e5c1b736bea9c47845e6916" ON "tv_series_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c74ccb2e3a6e6479b847d69e8" ON "tv_series_providers_streaming_provider" ("tvSerieId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3870df294212b069d35270aa4" ON "movies_providers_streaming_provider" ("streamingProviderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e15290faa67a8bd39bbf0ed7e" ON "movies_providers_streaming_provider" ("movieId") `);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_633e5c1b736bea9c47845e69164" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tv_series_providers_streaming_provider" ADD CONSTRAINT "FK_3c74ccb2e3a6e6479b847d69e8d" FOREIGN KEY ("tvSerieId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_e3870df294212b069d35270aa46" FOREIGN KEY ("streamingProviderId") REFERENCES "streaming_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movies_providers_streaming_provider" ADD CONSTRAINT "FK_4e15290faa67a8bd39bbf0ed7ee" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
