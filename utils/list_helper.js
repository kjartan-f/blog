const _ = require('lodash')

const dummy = () => {
  return 1
}


const totalLikes = (blogs) => {
  const likes = blogs.reduce((prev, current) => prev + current.likes, 0)
  return likes
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((prev,current) => (prev.likes > current.likes)? prev : current)

  return favorite
}



const mostBlogs = (blogs) => {
  const result = _(blogs)
    .groupBy('author')
    .map(function(item, itemId) {
      //console.log('item', item)
      var obj = {
        author : itemId,
        blogs : item.length
      }
      //obj[itemId] = _.countBy(item,'author')
      return obj
    })
    .reduce((prev, current) => (prev.blogs > current.blogs) ? prev : current)

  return result

}

const mostLikes = (blogs) => {
  const favorite = blogs.reduce((prev,current) => (prev.likes > current.likes)? prev : current)
  const totalLikes = blogs.filter(blog => blog.author === favorite.author ).reduce((prev,current) => prev + current.likes, 0)

  return { author: favorite.author, likes : totalLikes }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
