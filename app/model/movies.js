'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, DOUBLE, ENUM } = app.Sequelize;

  const Movies = app.model.define('movies', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    douban_id: { // 豆瓣id
      type: INTEGER,
      allowNull: true,
      unique: true,
    },
    aayyq_id: { // aayyq id
      type: INTEGER,
      allowNull: true,
      unique: true,
    },
    douban_rating: DOUBLE, // 豆瓣评分
    genres: STRING(255), // 流派，类型（动作/冒险）
    title: STRING(255), // 名称
    casts: STRING(255), // 主演（AA/BB)
    collect_count: INTEGER, // 看过人数
    original_title: STRING(255), // 原名
    subtype: { // 所属分类
      type: ENUM,
      allowNull: false,
      values: [ 'MOVIE', 'TV' ], // 类目：电影，电视
    },
    directors: STRING(255), // 导演 （AA/BB）
    year: STRING(30), // 年份
    images_id: { // 图片外键 id
      type: INTEGER,
      field: 'images_id',
      unique: true,
      references: {
        model: 'images',
        key: 'id',
      },
    },
    clarity: STRING(10), // 清晰度
    area: STRING(30), // 地区
    plot: STRING(500), // 剧情
    player_url: STRING(2000), // 播放地址
    update_time: DATE, // 更新日期
  },
  {
    indexes: [{
      name: 'movies_images_id',
      method: 'BTREE',
      fields: [ 'images_id' ],
    }],
  });

  return Movies;
};
