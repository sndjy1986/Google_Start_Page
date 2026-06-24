import https from 'https';

https.get('https://walkx.fyi/png/plex.png', (res) => {
  console.log('walkx.fyi', res.statusCode);
});

https.get('https://dashboardicons.com/png/plex.png', (res) => {
  console.log('dashboardicons.com/png', res.statusCode);
});

https.get('https://dashboardicons.com/svg/plex.svg', (res) => {
  console.log('dashboardicons.com/svg', res.statusCode);
});
