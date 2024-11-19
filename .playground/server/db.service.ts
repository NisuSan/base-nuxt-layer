import { existsSync, writeFileSync, readFileSync } from 'node:fs';

type TableName = 'todo' | 'reminder';
type TableType<T extends TableName> = T extends 'todo' ? ToDo : Reminder;

export default function db<T extends TableName>(table: T) {
  const file = `./server/db/${table}.json`;
  if (!existsSync(file)) {
    writeFileSync(file, JSON.stringify([]));
  }

  return {
    get: () => {
      const data = JSON.parse(readFileSync(file, 'utf-8')) as TableType<T>[];
      return data;
    },
    add: (data: Omit<TableType<T>, 'id'>) => {
      const items = JSON.parse(readFileSync(file, 'utf-8')) as TableType<T>[];
      const newItem = { ...data, id: items.length + 1 } as TableType<T>;
      items.push(newItem);
      writeFileSync(file, JSON.stringify(items));
      return newItem;
    },
    update: (data: TableType<T>) => {
      const items = JSON.parse(readFileSync(file, 'utf-8')) as TableType<T>[];
      const index = items.findIndex(item => item.id === data.id);
      if (index !== -1) {
        items[index] = { ...data };
        writeFileSync(file, JSON.stringify(items));
        return data;
      }
      return null;
    },
    remove: (id: number) => {
      const items = JSON.parse(readFileSync(file, 'utf-8')) as TableType<T>[];
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items.splice(index, 1);
        writeFileSync(file, JSON.stringify(items));
        return true;
      }
      return false;
    }
  };
}
