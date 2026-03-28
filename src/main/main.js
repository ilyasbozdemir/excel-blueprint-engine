const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const ExcelJS = require('exceljs');
const isDev = require('electron-is-dev');
const ExcelEngine = require('./ExcelEngine');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('window-control', (event, action) => {
  if (action === 'minimize') mainWindow.minimize();
  if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
  if (action === 'close') mainWindow.close();
});

ipcMain.handle('select-template', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('get-sheets', async (event, filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook.worksheets.map(ws => ws.name);
  } catch (error) {
    console.error('Error reading sheets:', error);
    return [];
  }
});

// Artık tüm işlemleri yeni ExcelEngine API üzerinden yapıyoruz
ipcMain.handle('process-excel-bulk', async (event, { templatePath, sheetName, dataMatrix, startRow, columnArray, includeHeader, outputName }) => {
  try {
    const downloadsPath = app.getPath('downloads');
    const finalOutputName = outputName || `Toplu_Sonuc_${Date.now()}`;
    const outputPath = path.join(downloadsPath, `${finalOutputName}.xlsx`);
    
    // API KULLANIMI: Formül koruma, Stil klonlama, Otomatik Header ve Matris Sütun Eşleme
    await ExcelEngine.fill(templatePath, outputPath, {
      sheetName,
      startRow: parseInt(startRow) || 4, 
      dataMatrix,
      columnArray,
      includeHeader
    });

    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Bulk Processing error:', error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle('execute-template-code', async (event, codeString) => {
  try {
    const downloadsPath = app.getPath('downloads');
    const outputPath = path.join(downloadsPath, `Koddan_Uretilen_${Date.now()}.xlsx`);
    
    await ExcelEngine.executeTemplateCode(codeString, outputPath);
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Execute Code error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extract-template', async (event, filePath, headerRows) => {
  try {
    return await ExcelEngine.extractTemplateToCode(filePath, headerRows);
  } catch (error) {
    console.error('Extraction error:', error);

    return `// Hata: ${error.message}`;
  }
});

ipcMain.handle('open-file', async (event, filePath) => {

  if (filePath) {
    // Windows için dosya yolunu seçili göstererek açan en sağlam yöntem
    shell.showItemInFolder(path.resolve(filePath)); 
    return true;
  }
  return false;
});




