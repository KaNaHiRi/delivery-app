import fs from 'fs';
import path from 'path';
import type { Delivery } from '@/app/types/delivery';

const DATA_FILE = path.join(process.cwd(), 'data', 'deliveries.json');

// C# の File.ReadAllText() + JsonSerializer.Deserialize() に相当
function readDeliveries(): Delivery[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // ファイルが存在しない場合は空配列を返す
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as Delivery[];
  } catch {
    return [];
  }
}

// C# の File.WriteAllText() + JsonSerializer.Serialize() に相当
function writeDeliveries(deliveries: Delivery[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(deliveries, null, 2));
}

export const deliveryStore = {
  getAll: readDeliveries,
  save: writeDeliveries,
};