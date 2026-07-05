import https from 'https';

const url = 'https://jaydeepnextorbit.github.io/NextOrbit/New_heo_mobile.mp4';
console.log(`Checking URL: ${url}`);

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:');
  console.log(res.headers);
  res.resume();
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
