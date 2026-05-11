import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const db=new sequelize(process.env.DATABASE_NAME,process.env.DATABASE_USERNAME,process.env.DATABASE_PASSWORD,{
    host:process.env.DATABASE_HOST,
    port:process.env.DATABASE_PORT,
    dialect:"mysql",
    logging:false,
    timeZone:"+05:30"
});

export default db;
