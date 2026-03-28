const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectTemplate: () => ipcRenderer.invoke('select-template'),
  getSheets: (templatePath) => ipcRenderer.invoke('get-sheets', templatePath),
  extractTemplate: (filePath, headerRows) => ipcRenderer.invoke('extract-template', filePath, headerRows),

  processExcel: (options) => ipcRenderer.invoke('process-excel', options),

  processExcelBulk: (options) => ipcRenderer.invoke('process-excel-bulk', options),
  executeTemplateCode: (codeString) => ipcRenderer.invoke('execute-template-code', codeString),
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
});



