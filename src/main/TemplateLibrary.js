/**
 * EXCEL ŞABLON KÜTÜPHANESİ
 * 
 * Nereye Yapıştıracağız? -> Tam buraya! 
 * Ürettiğiniz "EXCELJS OPTIMIZED TEMPLATE CODE" içeriğini aşağıdaki fonksiyonlara yapıştırabilirsiniz.
 */

const ExcelJS = require('exceljs');

class TemplateLibrary {

    /**
     * Örnek Su Defteri Şablonu
     * Buradaki kodları jeneratörden alıp güncelleyebilirsiniz.
     */
    static async getSuDefteriTemplate() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // --- BURADAN AŞAĞISINA ÜRETİLEN KODU YAPIŞTIRIN ---
        worksheet.getColumn(1).width = 25.7109375;
        // ... (Jeneratörden gelen diğer satırlar)
        
        return workbook;
    }

    /**
     * Yeni Sablonlarinizi Buraya Ekleyebilirsiniz
     */
    static async getCustomTemplate_1() {
        // Jeneratör çıktısını buraya yapıştırın...
    }

}

module.exports = TemplateLibrary;
