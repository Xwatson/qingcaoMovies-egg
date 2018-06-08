
'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, DOUBLE } = app.Sequelize;

  const Images = app.model.define('images', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        small: STRING(1000),
        large: STRING(1000),
        medium: STRING(1000)
    })
}