'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Movies = app.model.define('movies', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    aayyq_id: {
      type: INTEGER,
      allowNull: false,
      unique: true,
    },
    title: STRING(30),
    image_url: STRING(1000),
    status: STRING(10),
    starring: STRING(30),
    type: STRING(10),
    director: STRING(30),
    area: STRING(30),
    player_url: STRING(2000),
    update_time: DATE,
    created_at: DATE,
    updated_at: DATE,
  });

  return Movies;
};
