import { prisma } from './prisma';
import type { Delivery } from '@/app/types/delivery';

function toDelivery(record: {
  id: string;
  name: string;
  address: string;
  status: string;
  deliveryDate: string;
}): Delivery {
  return {
    id: record.id,
    name: record.name,
    address: record.address,
    status: record.status as Delivery['status'],
    deliveryDate: record.deliveryDate,
  };
}

export const deliveryStore = {
  async getAll(): Promise<Delivery[]> {
    const records = await prisma.delivery.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toDelivery);
  },

  async getById(id: string): Promise<Delivery | null> {
    const record = await prisma.delivery.findUnique({ where: { id } });
    return record ? toDelivery(record) : null;
  },

  async create(data: Omit<Delivery, 'id'>): Promise<Delivery> {
    const record = await prisma.delivery.create({
      data: {
        name: data.name,
        address: data.address,
        status: data.status,
        deliveryDate: data.deliveryDate,
      },
    });
    return toDelivery(record);
  },

  async update(id: string, data: Partial<Omit<Delivery, 'id'>>): Promise<Delivery | null> {
    try {
      const record = await prisma.delivery.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.deliveryDate !== undefined && { deliveryDate: data.deliveryDate }),
        },
      });
      return toDelivery(record);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.delivery.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async deleteAll(): Promise<void> {
    await prisma.delivery.deleteMany();
  },
};