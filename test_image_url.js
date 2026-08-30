const photo = { some: "object" };
const url = photo.file_url || photo.url || photo.image || photo;
console.log(typeof url, url);
try {
  url.startsWith('http');
} catch(e) {
  console.log("Error:", e.message);
}
