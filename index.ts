import { Db, IndexSpecification, MongoClient } from 'mongodb';
export type Schema = {
    collections: Record<string, {
        indexes: (
            | { field: string; type: 'default'; indexSpec: { pattern: number } }
            | { field: string; type: 'compound'; indexSpec: Record<string, number> }
            | { field: string; type: 'sparse'; indexSpec: { pattern: number } }
            | { field: string; type: 'ttl'; indexSpec: { pattern: number; expiresAfterSeconds: number } }
        )[];
    }>;
};
export default class Applier {
    private client: MongoClient;
    private db: Db;
    constructor(ip: string, db: string, options?: Record<string, string | boolean>) {
        this.client = new MongoClient(`${ip}/?${Object.entries(options || {}).map(([key, value]) => `${key}=${value}`).join('&')}`);
        this.db = this.client.db(db);
    }
    async apply(schema: Schema) {
        try {
            await this.client.connect();
            await Promise.all(Object.entries(schema.collections).map(([collection, { indexes }]) => indexes.map(({ field, type, indexSpec }) => {
                switch (type) {
                    case 'compound': return this.db.collection(collection).createIndex(indexSpec as IndexSpecification);
                    case 'sparse': return this.db.collection(collection).createIndex({ [field]: indexSpec.pattern }, { sparse: true });
                    case 'ttl': return this.db.collection(collection).createIndex({ [field]: indexSpec.pattern }, { expireAfterSeconds: indexSpec.expiresAfterSeconds });
                    default: return this.db.collection(collection).createIndex({ [field]: indexSpec.pattern });
                }
            })).flat(1));
        } finally {
            await this.client.close();
        }
    }
    async clear(schema: Schema) {
        try {
            await this.client.connect();
            await Promise.all(Object.keys(schema.collections).map(collection => this.db.collection(collection).dropIndexes()));
        } finally {
            await this.client.close();
        }
    }
};