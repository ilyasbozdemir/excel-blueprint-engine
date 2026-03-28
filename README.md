# Excel Şablon Klonlama API

Bu uygulama, existing (mevcut) Excel şablonlarını klonlayarak, içerisindeki **stilleri (renk, font, kenarlık)** ve **formülleri** bozmadan dinamik veri enjekte etmenizi sağlar.

## Özellikler
- **Stil Koruma**: Orijinal dosyadaki tüm grafik, stil ve biçimlendirmeler korunur.
- **Formül Desteği**: Excel formülleri (SUM, VLOOKUP vb.) aktif olarak kalır.
- **Modern Arayüz**: Glassmorphism tasarımı ile kullanıcı dostu deneyim.
- **Dinamik Hücre Erişimi**: Hücre bazlı (A1, B2 vb.) veri girişi.

## Başlatma
Uygulamayı yerelinizde çalıştırmak için:

1. Bağımlılıkları kurun (Zaten yüklü değilse):
   ```bash
   npm install
   ```
2. Geliştirici modunda başlatın:
   ```bash
   npm run dev
   ```
3. Ayrı bir terminalde veya Vite başladıktan sonra:
   ```bash
   npm start
   ```

## Kullanım
1. **Şablon Seç**: Dosya seçici ile `.xlsx` şablonunuzu yükleyin.
2. **Tablo Seç**: Veri yazmak istediğiniz Sheet adını seçin.
3. **Veri Gir**: "Veri Düzenleme" tabına geçerek hücre koordinatı ve yazılacak değeri girin.
4. **Kaydet**: "Klonla ve Kaydet" butonuna bastığınızda, dosya formülleri korunarak "İndirilenler" klasörüne kaydedilir.
