import { connectToDatabase } from './db';
import { storage, MongoDbStorage, IStorage } from './storage';
import { setMongoDbConnected } from './db-utils';
import { log } from './vite';

/**
 * Initialize MongoDB storage and replace the default in-memory storage
 * @returns Promise that resolves to the storage instance
 */
export async function initializeMongoDbStorage(): Promise<IStorage> {
  try {
    log('Connecting to MongoDB...', 'express');
    const client = await connectToDatabase();
    
    log('Creating MongoDB storage instance...', 'express');
    const mongoStorage = new MongoDbStorage(client);
    
    // Replace the global storage reference with MongoDB implementation
    (global as any).storage = mongoStorage;
    
    // Update connection status flag for health checks
    setMongoDbConnected(true);
    
    log('MongoDB storage initialized successfully', 'express');
    return mongoStorage;
  } catch (error) {
    log(`Failed to initialize MongoDB storage: ${error}`, 'express');
    log('Falling back to in-memory storage', 'express');
    
    // Keep using the default in-memory storage
    return storage;
  }
}
