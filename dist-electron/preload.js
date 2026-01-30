import { contextBridge as s, ipcRenderer as o } from "electron";
s.exposeInMainWorld("ipcRenderer", {
  on(...n) {
    const [e, r] = n;
    return o.on(e, (t, ...c) => r(t, ...c));
  },
  off(...n) {
    const [e, ...r] = n;
    return o.off(e, ...r);
  },
  send(...n) {
    const [e, ...r] = n;
    return o.send(e, ...r);
  },
  invoke(...n) {
    const [e, ...r] = n;
    return o.invoke(e, ...r);
  }
  // You can expose other apts you need here.
  // ...
});
