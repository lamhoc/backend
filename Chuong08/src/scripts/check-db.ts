import { sequelize } from "../config/database.js";

async function main() {
    try {
        await sequelize.authenticate();

        console.log("DB connected: QuanLySinhVienDB");
    } catch (error) {
        console.error("Không thể kết nối Database.");

        if (error instanceof Error) {
            console.error(error.message);
        }

        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

main();