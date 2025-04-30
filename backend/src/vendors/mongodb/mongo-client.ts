import { MongoClient as Client, Db, Collection, MongoClientOptions, IndexSpecification } from 'mongodb';
import { MongoDocument } from './mongo-types';

export class MongoClient {
  private client: Client | null = null;
  private db: Db | null = null;
  private static instance: MongoClient | null = null;

  private constructor() {}

  public static getInstance(): MongoClient {
    if (!MongoClient.instance) {
      MongoClient.instance = new MongoClient();
    }
    return MongoClient.instance;
  }

  public async connect(uri: string, dbName: string): Promise<void> {
    if (!this.client) {
      const connectionOptions: MongoClientOptions = {
        serverApi: { version: '1', strict: true, deprecationErrors: true },
      };
      
      this.client = new Client(uri, connectionOptions);
      // await this.client.connect();
      this.db = this.client.db(dbName);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      // await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  public getCollection<T extends MongoDocument>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database connection not established');
    }
    return this.db.collection<T>(collectionName);
  }

  public async createIndex<T extends MongoDocument>(
    collectionName: string,
    fieldOrSpec: IndexSpecification,
    options: object = {}
  ): Promise<string> {
    const collection = this.getCollection<T>(collectionName);
    return collection.createIndex(fieldOrSpec, options);
  }

  public async createTextIndex<T extends MongoDocument>(
    collectionName: string,
    fields: string[],
    options: object = {}
  ): Promise<string> {
    const textIndexSpec: Record<string, any> = {};
    fields.forEach(field => {
      textIndexSpec[field] = 'text';
    });
    
    return this.createIndex<T>(collectionName, textIndexSpec as unknown as IndexSpecification, options);
  }

  public isConnected(): boolean {
    return !!this.client && !!this.db;
  }
}
