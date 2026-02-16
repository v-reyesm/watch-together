import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1771225421621 implements MigrationInterface {
    name = 'FirstMigration1771225421621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movie" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "translatedTitle" character varying NOT NULL, "releaseDate" TIMESTAMP NOT NULL, "runtimeInMinutes" integer NOT NULL, "posterUrl" character varying NOT NULL, "imdbId" character varying NOT NULL, "tmdbId" integer NOT NULL, "overview" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "movie"`);
    }

}
