import { QueryOptions } from "sequelize";

// Store some constants too be used in the sql migration files
export const migrationHeader = `-- Migration type: #direction
-- Generated at: #timestamp
-- Name: #name
-- Backup: #backup
-- Description: #description
-- This file is generated. Do not remove the header!
-- -- --
`;

export const createMigrationTableQuery = (schemaName: string): string => `
	CREATE TABLE IF NOT EXISTS "migrates".migrations_${schemaName} (
	id SERIAL PRIMARY KEY,
	uuid uuid DEFAULT uuid_generate_v4(),
	file_name bigint,
	content_up text,
	content_down text,
	checksum_up character varying(255),
	checksum_down character varying(255),
	properties smallint,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone DEFAULT NULL
)`;

export enum ETerminalColor {
	WHITE = "\x1b[37m",
	CYAN = "\x1b[36m",
	GREEN = "\x1b[32m",
}

export enum EMigrationProperties {
	UP = 1,
	DOWN = 2,
	MIGRATE = 4,
	MERGE = 8,
	PROTECTED = 16,
	LOCAL = 32,
	SYNC = 64,
}

/**
 * Extends the QueryOptions interface to add a rowCallback function
 * to modify the row before returning it.
 */
export interface IQueryOptions<T> extends QueryOptions {
	rowCallback?: (row: T, index: number) => T;
}
