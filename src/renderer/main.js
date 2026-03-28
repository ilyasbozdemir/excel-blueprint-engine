// Renderer Logic
const electronAPI = window.electronAPI;

if (!electronAPI) {
  console.error("Hata: electronAPI bulunamadı. Lütfen uygulamayı 'npm start' ile Electron içinde çalıştırdığınızdan emin olun!");
}

let templatePath = '';
let sheets = [];

// DOM Elements
const selectBtn = document.getElementById('select-btn');
const sheetSelector = document.getElementById('sheet-selector');
const filePathText = document.getElementById('file-path-text');
const templateInfo = document.getElementById('template-info');
const addRowBtn = document.getElementById('add-row-btn');
const dataEditor = document.querySelector('.data-editor');
const processBtn = document.getElementById('process-btn');
const outputNameInput = document.getElementById('output-name');
const statusBadge = document.getElementById('status-bar');
const statusMessage = document.getElementById('status-message');

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => {
    const tabId = item.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    item.classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
  };
});

// Window Controls
document.getElementById('minimize-btn').onclick = () => electronAPI.windowControl('minimize');
document.getElementById('maximize-btn').onclick = () => electronAPI.windowControl('maximize');
document.getElementById('close-btn').onclick = () => electronAPI.windowControl('close');

// File Selection
selectBtn.onclick = async () => {
  const path = await electronAPI.selectTemplate();
  if (path) {
    templatePath = path;
    filePathText.textContent = path.split('\\').pop();
    templateInfo.classList.remove('hidden');
    
    // Fetch Sheets
    sheets = await electronAPI.getSheets(path);
    sheetSelector.innerHTML = sheets.map(name => `<option value="${name}">${name}</option>`).join('');
    
    // EXCEL'İ KODA DÖK (Extract Template)
    const codeBox = document.getElementById('generated-code-box');
    const codeExtractor = document.getElementById('code-extractor');
    codeBox.value = "// Analiz ediliyor...";
    codeExtractor.classList.remove('hidden');
    
    const headCount = document.getElementById('header-row-count').value || 3;
    const generatedCode = await electronAPI.extractTemplate(path, headCount);
    codeBox.value = generatedCode;

    // Stats
    const stats = document.getElementById('code-stats');
    const totalLines = generatedCode.split('\n').length;
    stats.innerHTML = `⚙️ Analiz: ${headCount} Başlık + Dinamik Gövde | Toplam: ${totalLines} Satır Code`;

    showStatus('Dosya ve Şablon Kodu Hazır!', 'success');
  }
};


// Kodu Kopyala
document.getElementById('copy-code-btn').onclick = () => {
  const codeBox = document.getElementById('generated-code-box');
  codeBox.select();
  document.execCommand('copy');
  showStatus('Kod Kopyalandı!');
};

// Kodu Çalıştır (Koddan Excel Üret)
document.getElementById('run-generated-code-btn').onclick = async () => {
    const code = document.getElementById('generated-code-box').value;
    if (!code) return showStatus("Önce kod üretilmesi lazım!", "error");

    try {
        showStatus("Kod yürütülüyor ve Excel dosyası oluşturuluyor...", "info");
        const res = await electronAPI.executeTemplateCode(code);
        
        if (res.success) {
            showStatus("Dosya Başarıyla Üretildi!", "success", res.path);
        } else {
            showStatus("Hata: " + res.error, "error");
        }
    } catch (err) {
        showStatus("Yürütme Hatası: " + err.message, "error");
    }
};



// Data Editor: Add Row
addRowBtn.onclick = () => {
  const row = document.createElement('div');
  row.className = 'data-input-row';
  row.innerHTML = `
    <input type="text" placeholder="Hücre (örn: A1)" class="cell-addr">
    <input type="text" placeholder="Değer" class="cell-val">
    <button class="remove-btn">×</button>
  `;
  dataEditor.insertBefore(row, addRowBtn);
  
  row.querySelector('.remove-btn').onclick = () => row.remove();
};

// Data Editor: Initial row remove logic
document.querySelectorAll('.remove-btn').forEach(btn => {
  btn.onclick = (e) => e.target.closest('.data-input-row').remove();
});

// Process
processBtn.onclick = async () => {
  if (!templatePath) return showStatus('Önce bir şablon seçin!', 'error');
  
  const data = [];
  document.querySelectorAll('.data-input-row').forEach(row => {
    const cell = row.querySelector('.cell-addr').value;
    const value = row.querySelector('.cell-val').value;
    if (cell && value) {
      data.push({ cell: cell, value: value });
    }
  });

  if (data.length === 0) return showStatus('En az bir hücre değeri girin!', 'error');

  showStatus('İşlem yapılıyor...');
  
  const result = await electronAPI.processExcel({
    templatePath,
    sheetName: sheetSelector.value,
    data,
    outputName: outputNameInput.value || 'Sonuc_Excel'
  });

  if (result.success) {
    showStatus(`Başarılı! Dosya kaydedildi: ${result.path}`);
  } else {
    showStatus(`Hata oluştu: ${result.error}`, 'error');
  }
};

// Bulk Process
const bulkProcessBtn = document.getElementById('bulk-process-btn');
const bulkDataList = document.getElementById('bulk-data-list');
const bulkColumns = document.getElementById('bulk-columns');
const bulkStartRow = document.getElementById('bulk-start-row');
const bulkOutputName = document.getElementById('bulk-output-name');
const addHeaderCheck = document.getElementById('add-header-check');

bulkProcessBtn.onclick = async () => {
  try {
    const inputVal = JSON.parse(bulkDataList.value.trim());
    // columnArray zorunlu değil artık, objelerde cell bazlı gidebiliriz
    let columnArray = [];
    try {
        columnArray = JSON.parse(bulkColumns.value.trim());
    } catch(e) { columnArray = null; }

    const startRow = parseInt(bulkStartRow.value);
    const includeHeader = addHeaderCheck.checked;
    const outputName = bulkOutputName.value || 'Toplu_Sonuc';

    const payload = {
      templatePath,
      sheetName: sheetSelector.value || 1,
      startRow,
      outputName,
      dataMatrix: inputVal, // Bu artık [ {"A4": "X"}, {"A5": "Y"} ] olabilir
      columnArray,
      includeHeader
    };

    showStatus('Toplu işlem yapılıyor...', 'info');
    const result = await electronAPI.processExcelBulk(payload);


    if (result.success) {
      showStatus(`Başarılı! İşlem tamamlandı.`, 'success', result.path);
    } else {
      showStatus(`Hata: ${result.error}`, 'error');
    }
  } catch (err) {
    showStatus(`Hata: ${err.message}`, 'error');
  }
};



function showStatus(text, type = 'success', filePath = null) {
  statusMessage.innerHTML = `<span>${text}</span>`;
  
  if (filePath) {
    const openBtn = document.createElement('button');
    openBtn.className = 'btn-mini';
    openBtn.textContent = 'Dosyayı Aç';
    openBtn.style.marginLeft = '15px';
    openBtn.style.padding = '4px 8px';
    openBtn.style.background = 'white';
    openBtn.style.color = 'black';
    openBtn.style.borderRadius = '4px';
    openBtn.style.border = 'none';
    openBtn.style.cursor = 'pointer';
    openBtn.onclick = () => electronAPI.openFile(filePath);
    statusMessage.appendChild(openBtn);
  }

  statusBadge.className = `status-badge ${type}`;
  statusBadge.classList.remove('hidden');
  
  if (!filePath) {
    setTimeout(() => statusBadge.classList.add('hidden'), 5000);
  }
}


