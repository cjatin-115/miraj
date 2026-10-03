import fs from 'fs';
import path from 'path';
import http from 'http';
import net from 'net';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function startMediaServer(): Promise<{
  server: http.Server;
  urlFor: (filePath: string) => string;
  close: () => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const rawPath = parsedUrl.searchParams.get('file');
      if (!rawPath) {
        res.writeHead(400);
        res.end('Missing file param');
        return;
      }

      const targetPath = path.resolve(decodeURIComponent(rawPath));
      if (!fs.existsSync(targetPath)) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }

      const stat = fs.statSync(targetPath);
      const totalSize = stat.size;
      const range = req.headers.range;

      const ext = path.extname(targetPath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        const chunkSize = end - start + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        fs.createReadStream(targetPath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': totalSize,
          'Accept-Ranges': 'bytes',
          'Content-Type': contentType,
        });
        fs.createReadStream(targetPath).pipe(res);
      }
    });

    server.on('error', reject);

    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as any).port;
      resolve({
        server,
        urlFor: (filePath: string) =>
          `http://127.0.0.1:${port}/?file=${encodeURIComponent(path.resolve(filePath))}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

function resolveMediaFileOnDisk(inputPath: string): string | null {
  if (!inputPath || typeof inputPath !== 'string') return null;

  let sub = inputPath;
  const storageIndex = inputPath.indexOf('/api/v1/storage/');
  if (storageIndex !== -1) {
    sub = inputPath.substring(storageIndex + '/api/v1/storage/'.length);
  } else {
    sub = sub.replace(/^https?:\/\/[^\/]+/, '');
    sub = sub.replace(/^file:\/\/\/?/, '');
  }

  const cleanSub = sub.replace(/^[\/\\]+/, '');

  const candidates = [
    inputPath,
    sub,
    cleanSub,
    path.resolve(cleanSub),
    path.resolve(process.cwd(), cleanSub),
    path.resolve(process.cwd(), 'storage', cleanSub),
    path.resolve(process.cwd(), 'storage', 'projects', cleanSub),
    path.resolve(__dirname, '../../..', cleanSub),
    path.resolve(__dirname, '../../../storage', cleanSub),
    path.resolve(__dirname, '../../../storage/projects', cleanSub),
  ];

  for (const cand of candidates) {
    try {
      if (cand && fs.existsSync(cand) && !fs.statSync(cand).isDirectory()) {
        const fullCand = path.resolve(cand);
        // Prefer normalized CFR MP4 for frame-accurate seeking and stable compositor
        if (!fullCand.endsWith('.mp4')) {
          const normInDir = path.join(path.dirname(fullCand), 'normalized.mp4');
          if (fs.existsSync(normInDir)) {
            return normInDir;
          }
          const normSibling = fullCand.replace(/\.[^.]+$/, '_normalized.mp4');
          if (fs.existsSync(normSibling)) {
            return normSibling;
          }
        }
        return fullCand;
      }
    } catch {
      // ignore invalid path errors
    }
  }

  return null;
}

function rewriteLocalPaths(obj: any, urlFor: (p: string) => string): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    const diskPath = resolveMediaFileOnDisk(obj);
    if (diskPath) {
      return urlFor(diskPath);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => rewriteLocalPaths(item, urlFor));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = rewriteLocalPaths(v, urlFor);
    }
    return res;
  }
  return obj;
}

function getBrowserExecutable(customPath?: string): string {
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  const candidates = [
    process.env.CHROME_BIN,
    process.env.EDGE_BIN,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    'No Chromium browser executable found. Please specify --browser path or install Edge/Chrome.'
  );
}

function parseArgs(): {
  timelinePath: string;
  outputPath: string;
  browserPath?: string;
  resolution?: string;
  fps?: number;
  frameRange?: [number, number];
} {
  const args = process.argv.slice(2);
  let timelinePath = '';
  let outputPath = '';
  let browserPath: string | undefined;
  let resolution: string | undefined;
  let fps: number | undefined;
  let frameRange: [number, number] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--timeline' && i + 1 < args.length) {
      timelinePath = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputPath = args[++i];
    } else if (args[i] === '--browser' && i + 1 < args.length) {
      browserPath = args[++i];
    } else if (args[i] === '--resolution' && i + 1 < args.length) {
      resolution = args[++i];
    } else if (args[i] === '--fps' && i + 1 < args.length) {
      fps = parseInt(args[++i], 10);
    } else if (args[i] === '--frameRange' && i + 1 < args.length) {
      const parts = args[++i].split(',').map((p) => parseInt(p.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        frameRange = [parts[0], parts[1]];
      }
    }
  }

  if (!timelinePath || !outputPath) {
    console.error(
      'Usage: tsx render-cli.ts --timeline <path-to-timeline.json> --output <path-to-output.mp4> [--browser <path>] [--frameRange <start,end>]'
    );
    process.exit(1);
  }

  return { timelinePath, outputPath, browserPath, resolution, fps, frameRange };
}

async function main() {
  const { timelinePath, outputPath, browserPath, resolution, fps: customFps, frameRange } = parseArgs();

  // 1. Load Timeline JSON
  if (!fs.existsSync(timelinePath)) {
    throw new Error(`Timeline file not found: ${timelinePath}`);
  }
  const timelineRaw = fs.readFileSync(timelinePath, 'utf8');
  const timeline = JSON.parse(timelineRaw);

  if (resolution) {
    const [w, h] = resolution.split('x').map((n) => parseInt(n, 10));
    if (w && h) {
      timeline.width = w;
      timeline.height = h;
    }
  }
  if (customFps) {
    timeline.fps = customFps;
  }

  const browserExecutable = getBrowserExecutable(browserPath);
  const mediaServer = await startMediaServer();
  const remotionPort = await getFreePort();

  try {
    const processedTimeline = rewriteLocalPaths(timeline, mediaServer.urlFor);

    console.log(JSON.stringify({ type: 'status', message: 'Bundling Remotion composition...', stage: 'bundling' }));

    // 2. Bundle Remotion Composition
    const entryPoint = path.resolve(__dirname, 'index.ts');
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
            '.jsx': ['.tsx', '.jsx'],
          },
        },
      }),
    });

    console.log(JSON.stringify({ type: 'status', message: 'Selecting composition and evaluating layout...', stage: 'selecting' }));

    // 3. Select Composition with dynamic inputProps
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MiraajVideo',
      inputProps: { timeline: processedTimeline },
      browserExecutable,
      port: remotionPort,
      timeoutInMilliseconds: 60000,
    });

    const totalFrames = frameRange ? frameRange[1] - frameRange[0] : composition.durationInFrames;
    console.log(
      JSON.stringify({
        type: 'composition_info',
        id: composition.id,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        totalFrames,
        durationSeconds: totalFrames / composition.fps,
      })
    );

    // Ensure output directory exists
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 4. Render Media to H.264 MP4
    console.log(JSON.stringify({ type: 'status', message: 'Starting frame-by-frame rendering...', stage: 'rendering', progress: 0 }));

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { timeline: processedTimeline },
      browserExecutable,
      concurrency: 2,
      port: remotionPort,
      timeoutInMilliseconds: 60000,
      frameRange,
      onProgress: ({ renderedFrames, encodedFrames }) => {
        const pct = Math.min(100, Math.round((renderedFrames / Math.max(1, totalFrames)) * 100));
        console.log(
          JSON.stringify({
            type: 'progress',
            progress: pct,
            renderedFrames,
            encodedFrames,
            totalFrames,
            stage: 'rendering',
          })
        );
      },
    });

    console.log(
      JSON.stringify({
        type: 'completed',
        outputPath,
        fileSize: fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0,
        stage: 'completed',
      })
    );
  } finally {
    await mediaServer.close();
  }
}

main().catch((err) => {
  console.error(
    JSON.stringify({
      type: 'error',
      message: err.message || String(err),
      stack: err.stack,
    })
  );
  process.exit(1);
});
