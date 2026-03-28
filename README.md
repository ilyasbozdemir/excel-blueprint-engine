# 📊 Excel Blueprint Master

[![Build and Release](https://github.com/ilyasbozdemir/excel-blueprint-engine/actions/workflows/release.yml/badge.svg)](https://github.com/ilyasbozdemir/excel-blueprint-engine/actions/workflows/release.yml)
[![Version](https://img.shields.io/badge/version-1.0.7-blue.svg)](https://github.com/ilyasbozdemir/excel-blueprint-engine/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/github/downloads/ilyasbozdemir/excel-blueprint-engine/total.svg)](https://github.com/ilyasbozdemir/excel-blueprint-engine/releases)
[![Stars](https://img.shields.io/github/stars/ilyasbozdemir/excel-blueprint-engine.svg)](https://github.com/ilyasbozdemir/excel-blueprint-engine/stargazers)
[![Package Manager](https://img.shields.io/badge/pnpm-certified-orange.svg)](https://pnpm.io/)

**Excel Blueprint Master**, mevcut Excel şablonlarını klonlayarak içerisindeki **stilleri (renk, font, kenarlık)**, **grafikleri** ve **formülleri** bozmadan dinamik veri enjekte etmenizi sağlayan yüksek performanslı bir masaüstü uygulamasıdır.

## ✨ Önemli Özellikler
- **🎨 Kusursuz Stil Koruma**: Orijinal dosyadaki tüm grafik, stil ve biçimlendirmeler (border, fill, font) birebir korunur.
- **🚀 Akıllı Kod Jeneratörü**: Excel şablonunuzu saniyeler içinde söküp (`extract`) temiz bir JavaScript/TypeScript koduna dönüştürür.
- **📈 Formül Desteği**: Excel formülleri (SUM, VLOOKUP vb.) aktif ve hesaplanabilir olarak kalır.
- **💎 Modern Arayüz**: Electron tabanlı Glassmorphism tasarımı ile premium kullanıcı deneyimi.
- **📂 Toplu İşlem Opsiyonu**: JSON verileri üzerinden binlerce satırı şablona otomatik enjekte etme.

## 🛠️ Kurulum ve Başlatma
Uygulamayı yerelinizde geliştirmek veya çalıştırmak için **pnpm** önerilir:

1. **Bağımlılıkları Kurun**:
   ```bash
   pnpm install
   ```
2. **Geliştirici Modunda (Hot-Reload) Başlatın**:
   ```bash
   pnpm dev
   ```
3. **Üretim (Production) Build Alın**:
   ```bash
   pnpm build
   ```

## 🚀 Kullanım Senaryosu
1. **Şablon Analizi**: `.xlsx` dosyanızı sürükleyin, "Kod Jeneratörü" ile şablonunuzun kod halini anında kopyalayın.
2. **Dinamik Veri Girişi**: "Hızlı Giriş" sekmesinde belirli hücre koordinatlarına (A1, B5 vb.) veri girerek anında klon oluşturun.
3. **Toplu Veri Enjeksiyonu**: JSON payload göndererek şablonu binlerce veri ile saniyeler içinde doldurup "İndirilenler" klasörüne kaydedin.

---
## 👨‍💻 Geliştirici
**Ilyas Bozdemir** ([ilyasbozdemir](https://github.com/ilyasbozdemir))
*Yüksek performanslı veri motorları ve Electron çözümleri.*

## 📄 Lisans
Bu proje **MIT** lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakabilirsiniz.

---
*Geliştirici dostu, hızlı ve hafif bir Excel motoru.*
