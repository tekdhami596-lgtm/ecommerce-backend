import { Sequelize } from "sequelize";
const sequelize = new Sequelize(
  "postgres://postgres:postgres@localhost:5438/postgres",
  {
    logging: false,
  },
);

export default sequelize;
