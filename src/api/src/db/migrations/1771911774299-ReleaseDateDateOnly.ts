import { MigrationInterface, QueryRunner } from "typeorm";

export class ReleaseDateDateOnly1771911774299 implements MigrationInterface {
    name = 'ReleaseDateDateOnly1771911774299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "media" ALTER COLUMN "releaseDate" TYPE date USING "releaseDate"::date`,
        );
        await queryRunner.query(
            `ALTER TABLE "movies" ALTER COLUMN "releaseDate" TYPE date USING "releaseDate"::date`,
        );
        await queryRunner.query(
            `ALTER TABLE "tv_series" ALTER COLUMN "releaseDate" TYPE date USING "releaseDate"::date`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "media" ALTER COLUMN "releaseDate" TYPE TIMESTAMP USING "releaseDate"::timestamp`,
        );
        await queryRunner.query(
            `ALTER TABLE "movies" ALTER COLUMN "releaseDate" TYPE TIMESTAMP USING "releaseDate"::timestamp`,
        );
        await queryRunner.query(
            `ALTER TABLE "tv_series" ALTER COLUMN "releaseDate" TYPE TIMESTAMP USING "releaseDate"::timestamp`,
        );
    }

}
