const fs = require('fs');
fetch('https://unsplash.com/s/photos/red-gown')
  .then(r => r.text())
  .then(t => {
    const regex = /images\.unsplash\.com\/photo-([a-zA-Z0-9\-]+)[^>]+alt="([^"]+)"/g;
    const matches = [...t.matchAll(regex)];
    const results = matches.slice(0, 10).map(m => m[1] + ' | ' + m[2]);
    console.log(JSON.stringify(results, null, 2));
  });
