
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export function createFileService(fileName) {
    const filePath = join(process.cwd(), fileName);

    async function getData() {
        try {
            const data = await readFile(filePath, "utf-8");
            return data ? JSON.parse(data) : [];
        } catch (error) {
            if (error.code === "ENOENT") {
                return [];
            }
            throw error;
        }
    }
     async function saveData(items) {
        await writeFile(
            filePath,
            JSON.stringify(items, null, 2)
        );
    }


    async function addItem(item) {
        const items = await getData();

        items.push(item);

        await writeFile(
            filePath,
            JSON.stringify(items, null, 2)
        );

        return item;
    }

    return { getData, addItem, saveData };

    

}
