'use strict';

class InTheaters {
  async start() {
    const res = await this.ctx.curl('https://api.douban.com/v2/movie/in_theaters?city=北京&count=50', {
      dataType: 'json',
    });
    const movies = [];
    if (res && res.data.subjects) {
      res.data.subjects.forEach(item => {
        // 过滤0分影片
        if (item.rating.average > 0) {
          movies.push({
            douban_id: parseInt(item.id),
            douban_rating: item.rating.average,
            genres: (item.genres || []).join('/'),
            title: item.title,
            casts: (item.casts || []).map(cast => cast.name).join('/'),
            collect_count: item.collect_count,
            original_title: item.original_title,
            subtype: item.subtype === 'movie' ? 'MOVIE' : 'TV',
            directors: (item.directors || []).map(d => d.name).join('/'),
            year: item.year,
            images: item.images,
          });
        }
      });
    }
    return movies;
  }
}

module.exports = InTheaters;
