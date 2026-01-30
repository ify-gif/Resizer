import { app as n, BrowserWindow as s, ipcMain as l, Notification as h, shell as _, Menu as m } from "electron";
import o from "node:path";
import { fileURLToPath as R } from "node:url";
const r = o.dirname(R(import.meta.url));
process.env.APP_ROOT = o.join(r, "..");
const t = process.env.VITE_DEV_SERVER_URL, P = o.join(process.env.APP_ROOT, "dist-electron"), a = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = t ? o.join(process.env.APP_ROOT, "public") : a;
let e;
function c() {
  e = new s({
    icon: o.join(process.env.VITE_PUBLIC, "logo.ico"),
    webPreferences: {
      preload: o.join(r, "preload.mjs")
    },
    width: 1200,
    height: 800,
    backgroundColor: "#171717",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#171717",
      symbolColor: "#74b1be",
      height: 32
    },
    title: "AV Image Resizer"
  }), m.setApplicationMenu(null), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), t ? e.loadURL(t) : e.loadFile(o.join(a, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  s.getAllWindows().length === 0 && c();
});
n.whenReady().then(c);
l.handle("show-notification", (d, { title: i, body: p }) => {
  new h({ title: i, body: p }).show();
});
l.handle("open-folder", (d, i) => {
  _.openPath(i);
});
export {
  P as MAIN_DIST,
  a as RENDERER_DIST,
  t as VITE_DEV_SERVER_URL
};
