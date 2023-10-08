const {DateTime} = require('luxon');
const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const markdownItInlineWrapper = require('markdown-it-inline-wrapper');
const htmlmin = require('html-minifier');
const readingTime = require('eleventy-plugin-reading-time');

module.exports = function (eleventyConfig) {
  // Copy the `img` and `fonts` folders to the output
  eleventyConfig.addPassthroughCopy('src/assets/fonts/');

  eleventyConfig.addWatchTarget('./src/assets/css/**/*.css');

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(readingTime);

  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('dd LLL yyyy');
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter('min', (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(
      tag => ['all', 'nav', 'post', 'words', 'work', 'lists'].indexOf(tag) === -1,
    );
  }

  eleventyConfig.addFilter('filterTagList', filterTagList);

  eleventyConfig.addCollection('til', function (collectionApi) {
    return collectionApi.getAll().filter(function (item) {
      // only return TILs
      return 'TILIndex' in item.data;
    }).sort(function(a, b) {
      return b.date - a.date; // sort by date - descending
    })
  });

  function orderSort(values, key, direction) {
    let vals = [...values];
    if (direction === 'desc') {
      return vals.sort((a, b) => a.data[key] - b.data[key]);
    }
    return vals.sort((a, b) => b.data[key] - a.data[key]);
  }

  eleventyConfig.addFilter('orderSort', orderSort);

  // Create an array of all tags
  eleventyConfig.addCollection('tagList', function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({
        safariReaderFix: true
      }),
      level: 2,
    slugify: eleventyConfig.getFilter('slug'),
  })
  .use(markdownItAttrs)
  .use(markdownItInlineWrapper);
  eleventyConfig.setLibrary('md', markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          res.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  // minify the html if it's in production mode
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (process.env.ELEVENTY_PRODUCTION && outputPath && outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk', 'html', 'jpg', 'png', 'svg'],
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
    },
  };
};
