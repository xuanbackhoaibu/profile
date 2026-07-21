const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const serverDir = path.join(dist, "server");
const hostingDir = path.join(dist, ".openai");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
};

const includeDirs = ["assets", "files", "projects"];
const includeFiles = ["index.html", "styles.css", "script.js"];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

function routeFor(filePath) {
  return `/${path.relative(root, filePath).split(path.sep).join("/")}`;
}

function addAsset(assets, filePath) {
  const route = routeFor(filePath);
  assets[route] = {
    body: fs.readFileSync(filePath).toString("base64"),
    type: contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
  };
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(serverDir, { recursive: true });
fs.mkdirSync(hostingDir, { recursive: true });

const assets = {};
includeFiles.forEach((file) => addAsset(assets, path.join(root, file)));
includeDirs.flatMap((dir) => walk(path.join(root, dir))).forEach((file) => addAsset(assets, file));

fs.copyFileSync(path.join(root, ".openai", "hosting.json"), path.join(hostingDir, "hosting.json"));

const worker = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";
    if (!path.extname?.(pathname) && assets[\`\${pathname}.html\`]) pathname = \`\${pathname}.html\`;

    const asset = assets[pathname];
    if (!asset) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(decodeBase64(asset.body), {
      headers: {
        "content-type": asset.type,
        "cache-control": pathname.includes("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=300",
      },
    });
  },
};
`;

fs.writeFileSync(
  path.join(serverDir, "index.js"),
  worker.replace("path.extname?.(pathname)", "/\\.[^/]+$/.test(pathname)"),
);

console.log(`Built ${Object.keys(assets).length} assets into dist/server/index.js`);
