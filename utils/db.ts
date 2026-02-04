
import { CompanyProfile } from '../data/companies';
import { NewsItem } from '../data/news';

const DB_NAME = 'VicoDB';
const DB_VERSION = 1;

export interface VectorItem {
    id: string;
    text: string;
    metadata: any;
    embedding: number[];
}

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Store for Companies
            if (!db.objectStoreNames.contains('companies')) {
                db.createObjectStore('companies', { keyPath: 'name' });
            }
            // Store for News
            if (!db.objectStoreNames.contains('news')) {
                db.createObjectStore('news', { keyPath: 'link' });
            }
            // Store for Vector DB (RAG)
            if (!db.objectStoreNames.contains('vectors')) {
                db.createObjectStore('vectors', { keyPath: 'id' });
            }
            // Store for User Settings/Session
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
    });
};

export const saveToDB = async (storeName: string, data: any[]) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Clear old data for simple sync (optional, depends on use case)
    // await store.clear(); 

    data.forEach(item => {
        store.put(item);
    });

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const loadFromDB = async (storeName: string): Promise<any[]> => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const clearStore = async (storeName: string) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};
