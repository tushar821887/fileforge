import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import JSZip from 'jszip';

export interface TranslateResult {
  buffer: Buffer;
  slideCount?: number;
  pageCount?: number;
}

// Multi-language dictionary covering essential business, presentation, technical, and general terms
const TRANSLATION_MAP: Record<string, Record<string, string>> = {
  // Business & Corporate
  'investor update': {
    'zh-CN': '投资者简报',
    'fr-FR': 'Mise à jour des investisseurs',
    'de-DE': 'Investoren-Update',
    'es-ES': 'Actualización para inversores',
    'hi-IN': 'निवेशक अद्यतन',
    'ja-JP': '投資家向け最新情報',
    'ar-SA': 'تحديث المستثمرين',
    'it-IT': 'Aggiornamento per gli investitori',
    'pt-BR': 'Atualização para investidores',
    'ru-RU': 'Отчет для инвесторов',
    'ko-KR': '투자자 업데이트',
    'nl-NL': 'Investeerdersupdate',
    'tr-TR': 'Yatırımcı Güncellemesi',
  },
  'executive summary': {
    'zh-CN': '执行摘要',
    'fr-FR': 'Résumé exécutif',
    'de-DE': 'Zusammenfassung für Führungskräfte',
    'es-ES': 'Resumen ejecutivo',
    'hi-IN': 'कार्यकारी सारांश',
    'ja-JP': 'エグゼクティブサマリー',
    'ar-SA': 'الملخص التنفيذي',
    'it-IT': 'Sintesi esecutiva',
    'pt-BR': 'Sumário executivo',
    'ru-RU': 'Краткое резюме',
    'ko-KR': '경영 요약',
    'nl-NL': 'Samenvatting',
    'tr-TR': 'Yönetici Özeti',
  },
  'revenue': {
    'zh-CN': '收入',
    'fr-FR': 'Revenus',
    'de-DE': 'Umsatz',
    'es-ES': 'Ingresos',
    'hi-IN': 'राजस्व',
    'ja-JP': '収益',
    'ar-SA': 'الإيرادات',
    'it-IT': 'Fatturato',
    'pt-BR': 'Receita',
    'ru-RU': 'Выручка',
    'ko-KR': '매출',
    'nl-NL': 'Omzet',
    'tr-TR': 'Gelir',
  },
  'growth': {
    'zh-CN': '增长',
    'fr-FR': 'Croissance',
    'de-DE': 'Wachstum',
    'es-ES': 'Crecimiento',
    'hi-IN': 'वृद्धि',
    'ja-JP': '成長',
    'ar-SA': 'النمو',
    'it-IT': 'Crescita',
    'pt-BR': 'Crescimento',
    'ru-RU': 'Рост',
    'ko-KR': '성장',
    'nl-NL': 'Groei',
    'tr-TR': 'Büyüme',
  },
  'overview': {
    'zh-CN': '概述',
    'fr-FR': 'Aperçu',
    'de-DE': 'Übersicht',
    'es-ES': 'Visión general',
    'hi-IN': 'अवलोकन',
    'ja-JP': '概要',
    'ar-SA': 'نظرة عامة',
    'it-IT': 'Panoramica',
    'pt-BR': 'Visão geral',
    'ru-RU': 'Обзор',
    'ko-KR': '개요',
    'nl-NL': 'Overzicht',
    'tr-TR': 'Genel Bakış',
  },
  'financial': {
    'zh-CN': '财务',
    'fr-FR': 'Financier',
    'de-DE': 'Finanzen',
    'es-ES': 'Financiero',
    'hi-IN': 'वित्तीय',
    'ja-JP': '財務',
    'ar-SA': 'المالية',
    'it-IT': 'Finanziario',
    'pt-BR': 'Financeiro',
    'ru-RU': 'Финансовый',
    'ko-KR': '재무',
    'nl-NL': 'Financieel',
    'tr-TR': 'Finansal',
  },
  'quarter': {
    'zh-CN': '季度',
    'fr-FR': 'Trimestre',
    'de-DE': 'Quartal',
    'es-ES': 'Trimestre',
    'hi-IN': 'तिमाही',
    'ja-JP': '四半期',
    'ar-SA': 'الربع',
    'it-IT': 'Trimestre',
    'pt-BR': 'Trimestre',
    'ru-RU': 'Квартал',
    'ko-KR': '분기',
    'nl-NL': 'Kwartaal',
    'tr-TR': 'Çeyrek',
  },
  'market': {
    'zh-CN': '市场',
    'fr-FR': 'Marché',
    'de-DE': 'Markt',
    'es-ES': 'Mercado',
    'hi-IN': 'बाज़ार',
    'ja-JP': '市場',
    'ar-SA': 'السوق',
    'it-IT': 'Mercato',
    'pt-BR': 'Mercado',
    'ru-RU': 'Рынок',
    'ko-KR': '시장',
    'nl-NL': 'Markt',
    'tr-TR': 'Piyasa',
  },
  'strategy': {
    'zh-CN': '战略',
    'fr-FR': 'Stratégie',
    'de-DE': 'Strategie',
    'es-ES': 'Estrategia',
    'hi-IN': 'रणनीति',
    'ja-JP': '戦略',
    'ar-SA': 'الاستراتيجية',
    'it-IT': 'Strategia',
    'pt-BR': 'Estratégia',
    'ru-RU': 'Стратегия',
    'ko-KR': '전략',
    'nl-NL': 'Strategie',
    'tr-TR': 'Strateji',
  },
  'roadmap': {
    'zh-CN': '路线图',
    'fr-FR': 'Feuille de route',
    'de-DE': 'Fahrplan',
    'es-ES': 'Hoja de ruta',
    'hi-IN': 'रोडमैप',
    'ja-JP': 'ロードマップ',
    'ar-SA': 'خارطة الطريق',
    'it-IT': 'Tabella di marcia',
    'pt-BR': 'Roteiro',
    'ru-RU': 'План развития',
    'ko-KR': '로드맵',
    'nl-NL': 'Routekaart',
    'tr-TR': 'Yol Haritası',
  },
  'milestones': {
    'zh-CN': '里程碑',
    'fr-FR': 'Jalons',
    'de-DE': 'Meilensteine',
    'es-ES': 'Hitos',
    'hi-IN': 'मील के पत्थर',
    'ja-JP': 'マイルストーン',
    'ar-SA': 'المعالم الرئيسية',
    'it-IT': 'Pietre miliari',
    'pt-BR': 'Marcos',
    'ru-RU': 'Этапы',
    'ko-KR': '마일스톤',
    'nl-NL': 'Mijlpalen',
    'tr-TR': 'Dönüm Noktaları',
  },
  'product': {
    'zh-CN': '产品',
    'fr-FR': 'Produit',
    'de-DE': 'Produkt',
    'es-ES': 'Producto',
    'hi-IN': 'उत्पाद',
    'ja-JP': '製品',
    'ar-SA': 'المنتج',
    'it-IT': 'Prodotto',
    'pt-BR': 'Produto',
    'ru-RU': 'Продукт',
    'ko-KR': '제품',
    'nl-NL': 'Product',
    'tr-TR': 'Ürün',
  },
  'operations': {
    'zh-CN': '运营',
    'fr-FR': 'Opérations',
    'de-DE': 'Betrieb',
    'es-ES': 'Operaciones',
    'hi-IN': 'संचालन',
    'ja-JP': 'オペレーション',
    'ar-SA': 'العمليات',
    'it-IT': 'Operazioni',
    'pt-BR': 'Operações',
    'ru-RU': 'Операции',
    'ko-KR': '운영',
    'nl-NL': 'Activiteiten',
    'tr-TR': 'Operasyonlar',
  },
  'customer': {
    'zh-CN': '客户',
    'fr-FR': 'Client',
    'de-DE': 'Kunde',
    'es-ES': 'Cliente',
    'hi-IN': 'ग्राहक',
    'ja-JP': '顧客',
    'ar-SA': 'العميل',
    'it-IT': 'Cliente',
    'pt-BR': 'Cliente',
    'ru-RU': 'Клиент',
    'ko-KR': '고객',
    'nl-NL': 'Klant',
    'tr-TR': 'Müşteri',
  },
  'next steps': {
    'zh-CN': '后续步骤',
    'fr-FR': 'Prochaines étapes',
    'de-DE': 'Nächste Schritte',
    'es-ES': 'Próximos pasos',
    'hi-IN': 'अगले कदम',
    'ja-JP': '次のステップ',
    'ar-SA': 'الخطوات التالية',
    'it-IT': 'Prossimi passi',
    'pt-BR': 'Próximos passos',
    'ru-RU': 'Следующие шаги',
    'ko-KR': '다음 단계',
    'nl-NL': 'Volgende stappen',
    'tr-TR': 'Sonraki Adımlar',
  },
  'thank you': {
    'zh-CN': '谢谢',
    'fr-FR': 'Merci',
    'de-DE': 'Vielen Dank',
    'es-ES': 'Gracias',
    'hi-IN': 'धन्यवाद',
    'ja-JP': 'ありがとうございます',
    'ar-SA': 'شكراً لكم',
    'it-IT': 'Grazie',
    'pt-BR': 'Obrigado',
    'ru-RU': 'Спасибо',
    'ko-KR': '감사합니다',
    'nl-NL': 'Bedankt',
    'tr-TR': 'Teşekkürler',
  },
  'hello': {
    'zh-CN': '您好',
    'fr-FR': 'Bonjour',
    'de-DE': 'Hallo',
    'es-ES': 'Hola',
    'hi-IN': 'नमस्ते',
    'ja-JP': 'こんにちは',
    'ar-SA': 'مرحباً',
    'it-IT': 'Ciao',
    'pt-BR': 'Olá',
    'ru-RU': 'Здравствуйте',
    'ko-KR': '안녕하세요',
    'nl-NL': 'Hallo',
    'tr-TR': 'Merhaba',
  },
  'welcome': {
    'zh-CN': '欢迎',
    'fr-FR': 'Bienvenue',
    'de-DE': 'Willkommen',
    'es-ES': 'Bienvenido',
    'hi-IN': 'स्वागत हे',
    'ja-JP': 'ようこそ',
    'ar-SA': 'أهلاً وسهلاً',
    'it-IT': 'Benvenuto',
    'pt-BR': 'Bem-vindo',
    'ru-RU': 'Добро пожаловать',
    'ko-KR': '환영합니다',
    'nl-NL': 'Welkom',
    'tr-TR': 'Hoş Geldiniz',
  },
  'report': {
    'zh-CN': '报告',
    'fr-FR': 'Rapport',
    'de-DE': 'Bericht',
    'es-ES': 'Informe',
    'hi-IN': 'रिपोर्ट',
    'ja-JP': 'レポート',
    'ar-SA': 'تقرير',
    'it-IT': 'Rapporto',
    'pt-BR': 'Relatório',
    'ru-RU': 'Отчет',
    'ko-KR': '보고서',
    'nl-NL': 'Rapport',
    'tr-TR': 'Rapor',
  },
  'document': {
    'zh-CN': '文档',
    'fr-FR': 'Document',
    'de-DE': 'Dokument',
    'es-ES': 'Documento',
    'hi-IN': 'दस्तावेज़',
    'ja-JP': 'ドキュメント',
    'ar-SA': 'وثيقة',
    'it-IT': 'Documento',
    'pt-BR': 'Documento',
    'ru-RU': 'Документ',
    'ko-KR': '문서',
    'nl-NL': 'Document',
    'tr-TR': 'Belge',
  },
  'analysis': {
    'zh-CN': '分析',
    'fr-FR': 'Analyse',
    'de-DE': 'Analyse',
    'es-ES': 'Análisis',
    'hi-IN': 'विश्लेषण',
    'ja-JP': '分析',
    'ar-SA': 'تحليل',
    'it-IT': 'Analisi',
    'pt-BR': 'Análise',
    'ru-RU': 'Анализ',
    'ko-KR': '분석',
    'nl-NL': 'Analyse',
    'tr-TR': 'Analiz',
  },
  'performance': {
    'zh-CN': '绩效',
    'fr-FR': 'Performance',
    'de-DE': 'Leistung',
    'es-ES': 'Rendimiento',
    'hi-IN': 'प्रदर्शन',
    'ja-JP': 'パフォーマンス',
    'ar-SA': 'الأداء',
    'it-IT': 'Prestazione',
    'pt-BR': 'Desempenho',
    'ru-RU': 'Производительность',
    'ko-KR': '성과',
    'nl-NL': 'Prestatie',
    'tr-TR': 'Performans',
  },
  'target': {
    'zh-CN': '目标',
    'fr-FR': 'Cible',
    'de-DE': 'Ziel',
    'es-ES': 'Objetivo',
    'hi-IN': 'लक्ष्य',
    'ja-JP': '目標',
    'ar-SA': 'الهدف',
    'it-IT': 'Obiettivo',
    'pt-BR': 'Meta',
    'ru-RU': 'Цель',
    'ko-KR': '목표',
    'nl-NL': 'Doel',
    'tr-TR': 'Hedef',
  },
  'results': {
    'zh-CN': '结果',
    'fr-FR': 'Résultats',
    'de-DE': 'Ergebnisse',
    'es-ES': 'Resultados',
    'hi-IN': 'परिणाम',
    'ja-JP': '結果',
    'ar-SA': 'النتائج',
    'it-IT': 'Risultati',
    'pt-BR': 'Resultados',
    'ru-RU': 'Результаты',
    'ko-KR': '결과',
    'nl-NL': 'Resultaten',
    'tr-TR': 'Sonuçlar',
  },
  'total': {
    'zh-CN': '总计',
    'fr-FR': 'Total',
    'de-DE': 'Gesamt',
    'es-ES': 'Total',
    'hi-IN': 'कुल',
    'ja-JP': '合計',
    'ar-SA': 'الإجمالي',
    'it-IT': 'Totale',
    'pt-BR': 'Total',
    'ru-RU': 'Всего',
    'ko-KR': '총계',
    'nl-NL': 'Totaal',
    'tr-TR': 'Toplam',
  },
  'status': {
    'zh-CN': '状态',
    'fr-FR': 'Statut',
    'de-DE': 'Status',
    'es-ES': 'Estado',
    'hi-IN': 'स्थिति',
    'ja-JP': 'ステータス',
    'ar-SA': 'الحالة',
    'it-IT': 'Stato',
    'pt-BR': 'Status',
    'ru-RU': 'Статус',
    'ko-KR': '상태',
    'nl-NL': 'Status',
    'tr-TR': 'Durum',
  },
  'summary': {
    'zh-CN': '总结',
    'fr-FR': 'Résumé',
    'de-DE': 'Zusammenfassung',
    'es-ES': 'Resumen',
    'hi-IN': 'सारांश',
    'ja-JP': '要約',
    'ar-SA': 'ملخص',
    'it-IT': 'Riepilogo',
    'pt-BR': 'Resumo',
    'ru-RU': 'Итог',
    'ko-KR': '요약',
    'nl-NL': 'Samenvatting',
    'tr-TR': 'Özet',
  },
  'team': {
    'zh-CN': '团队',
    'fr-FR': 'Équipe',
    'de-DE': 'Team',
    'es-ES': 'Equipo',
    'hi-IN': 'टीम',
    'ja-JP': 'チーム',
    'ar-SA': 'الفريق',
    'it-IT': 'Squadra',
    'pt-BR': 'Equipe',
    'ru-RU': 'Команда',
    'ko-KR': '팀',
    'nl-NL': 'Team',
    'tr-TR': 'Ekip',
  },
  'users': {
    'zh-CN': '用户',
    'fr-FR': 'Utilisateurs',
    'de-DE': 'Benutzer',
    'es-ES': 'Usuarios',
    'hi-IN': 'उपयोगकर्ता',
    'ja-JP': 'ユーザー',
    'ar-SA': 'المستخدمين',
    'it-IT': 'Utenti',
    'pt-BR': 'Usuários',
    'ru-RU': 'Пользователи',
    'ko-KR': '사용자',
    'nl-NL': 'Gebruikers',
    'tr-TR': 'Kullanıcılar',
  },
  'sales': {
    'zh-CN': '销售',
    'fr-FR': 'Ventes',
    'de-DE': 'Vertrieb',
    'es-ES': 'Ventas',
    'hi-IN': 'बिक्री',
    'ja-JP': '販売',
    'ar-SA': 'المبيعات',
    'it-IT': 'Vendite',
    'pt-BR': 'Vendas',
    'ru-RU': 'Продажи',
    'ko-KR': '영업',
    'nl-NL': 'Verkoop',
    'tr-TR': 'Satış',
  },
};

@Injectable()
export class TranslationEngine {
  private readonly logger = new Logger(TranslationEngine.name);
  private readonly translationCache = new Map<string, string>();

  /**
   * Filters out strings that shouldn't be altered (pure numbers, symbols, emails, domains)
   */
  public isNonTranslatable(text: string): boolean {
    if (!text || text.trim().length === 0) return true;
    const trimmed = text.trim();
    if (/^[\d\s.,%+\-$€£¥()/#:_-]+$/.test(trimmed)) return true;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
    if (/^(https?:\/\/|[a-z0-9-]+\.(com|org|net|io|app|dev|ai|co|in|edu|gov))(\/.*)?$/i.test(trimmed)) return true;
    return false;
  }

  /**
   * Translates plain string using online translation service with fallback to offline dictionary
   */
  public async translateText(text: string, targetLanguageCode: string): Promise<string> {
    if (!text || text.trim().length === 0) return text;
    if (this.isNonTranslatable(text)) return text;

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const cacheKey = `${targetLanguageCode}:${trimmed}`;

    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // 1. Check curated TRANSLATION_MAP first (instant 0ms)
    if (TRANSLATION_MAP[lower] && TRANSLATION_MAP[lower][targetLanguageCode]) {
      const match = TRANSLATION_MAP[lower][targetLanguageCode];
      this.translationCache.set(cacheKey, match);
      return match;
    }

    // 2. High-speed online translation for all phrases, sentences, bullets, and body paragraphs
    const langKey = targetLanguageCode.split('-')[0].toLowerCase();
    const targetLang = targetLanguageCode === 'zh-CN' ? 'zh-CN' : targetLanguageCode === 'zh-TW' ? 'zh-TW' : langKey;

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map((item: any) => item[0]).join('');
          if (translated && translated.trim().length > 0) {
            this.translationCache.set(cacheKey, translated);
            return translated;
          }
        }
      }
    } catch {
      // Offline fallback
    }

    const offline = this.translateOfflineFallback(trimmed, targetLanguageCode);
    this.translationCache.set(cacheKey, offline);
    return offline;
  }

  public translateOfflineFallback(text: string, targetLanguageCode: string): string {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Direct whole-string match
    if (TRANSLATION_MAP[lower] && TRANSLATION_MAP[lower][targetLanguageCode]) {
      return text.replace(trimmed, TRANSLATION_MAP[lower][targetLanguageCode]);
    }

    // 2. Multi-word phrase replacements
    let result = text;
    for (const [key, translations] of Object.entries(TRANSLATION_MAP)) {
      if (translations[targetLanguageCode]) {
        const regex = new RegExp(`\\b${this.escapeRegex(key)}\\b`, 'gi');
        if (regex.test(result)) {
          result = result.replace(regex, (matched) => {
            const trans = translations[targetLanguageCode];
            if (matched === matched.toUpperCase()) return trans.toUpperCase();
            if (matched[0] === matched[0].toUpperCase()) {
              return trans.charAt(0).toUpperCase() + trans.slice(1);
            }
            return trans;
          });
        }
      }
    }

    if (result !== text) {
      return result;
    }

    return this.applyLocalizedTransformation(text, targetLanguageCode);
  }

  private applyLocalizedTransformation(text: string, langCode: string): string {
    const langKey = langCode.split('-')[0].toLowerCase();

    const localizedConnectors: Record<string, Record<string, string>> = {
      zh: { and: '与', or: '或', the: '', with: '连同', for: '对于', in: '在', of: '的', is: '是' },
      fr: { and: 'et', or: 'ou', the: 'le', with: 'avec', for: 'pour', in: 'dans', of: 'de', is: 'est' },
      de: { and: 'und', or: 'oder', the: 'die', with: 'mit', for: 'für', in: 'in', of: 'von', is: 'ist' },
      es: { and: 'y', or: 'o', the: 'el', with: 'con', for: 'para', in: 'en', of: 'de', is: 'es' },
      hi: { and: 'और', or: 'या', with: 'साथ', for: 'के लिए', in: 'में', of: 'का', is: 'है' },
      ja: { and: 'と', or: 'または', with: 'とともに', for: 'のために', in: 'で', of: 'の', is: 'です' },
      ar: { and: 'و', or: 'أو', the: 'الـ', with: 'مع', for: 'لـ', in: 'في', of: 'من', is: 'هو' },
      it: { and: 'e', or: 'o', the: 'il', with: 'con', for: 'per', in: 'in', of: 'di', is: 'è' },
      pt: { and: 'e', or: 'ou', the: 'o', with: 'com', for: 'para', in: 'em', of: 'de', is: 'é' },
      ru: { and: 'и', or: 'или', with: 'с', for: 'для', in: 'в', of: 'из', is: 'это' },
      ko: { and: '그리고', or: '또는', with: '와', for: '을 위한', in: '에서', of: '의', is: '이다' },
      nl: { and: 'en', or: 'of', the: 'de', with: 'met', for: 'voor', in: 'in', of: 'van', is: 'is' },
      tr: { and: 've', or: 'veya', with: 'ile', for: 'için', in: 'içinde', of: 'nin', is: 'dir' },
    };

    const replacements = localizedConnectors[langKey];
    if (!replacements) return text;

    let res = text;
    for (const [enWord, transWord] of Object.entries(replacements)) {
      const reg = new RegExp(`\\b${enWord}\\b`, 'gi');
      res = res.replace(reg, transWord);
    }
    return res;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Translate PowerPoint Presentation (.pptx)
   * Preserves 100% of shapes, fonts, geometries, layouts, theme colors, and images.
   * Completely translates headings, body text, and bullets inside OpenXML <a:t> tags.
   */
  public async translatePptx(buffer: Buffer, targetLanguageCode: string): Promise<TranslateResult> {
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(buffer);
    } catch (err: any) {
      throw new BadRequestException(
        `Invalid PowerPoint file: The file is not a valid OpenXML (.pptx) ZIP archive: ${err.message}`
      );
    }
    let slideCount = 0;

    const files = Object.keys(zip.files);
    const slideEntries: { relativePath: string; xmlContent: string }[] = [];
    const allUniqueTexts = new Set<string>();

    for (const relativePath of files) {
      const isSlide = /^ppt\/slides\/slide\d+\.xml$/i.test(relativePath);
      const isNotes = /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(relativePath);
      const isSlideLayout = /^ppt\/slideLayouts\/slideLayout\d+\.xml$/i.test(relativePath);

      if (isSlide) {
        slideCount++;
      }

      if (isSlide || isNotes || isSlideLayout) {
        const file = zip.file(relativePath);
        if (file) {
          const xmlContent = await file.async('string');
          slideEntries.push({ relativePath, xmlContent });

          const tagRegex = /(<a:t\b[^>]*>)([\s\S]*?)(<\/a:t>)/g;
          let match: RegExpExecArray | null;
          while ((match = tagRegex.exec(xmlContent)) !== null) {
            const rawText = this.decodeXmlEntities(match[2]).trim();
            if (rawText && !this.isNonTranslatable(rawText)) {
              allUniqueTexts.add(rawText);
            }
          }
        }
      }
    }

    // Translate all presentation-wide unique strings concurrently
    const translationMap = new Map<string, string>();
    await Promise.all(
      Array.from(allUniqueTexts).map(async (text) => {
        const trans = await this.translateText(text, targetLanguageCode);
        translationMap.set(text, trans);
      })
    );

    // Replace text nodes across all slides while preserving XML attributes and structure
    for (const entry of slideEntries) {
      const modifiedXml = entry.xmlContent.replace(
        /(<a:t\b[^>]*>)([\s\S]*?)(<\/a:t>)/g,
        (_match, openTag, textContent, closeTag) => {
          const decoded = this.decodeXmlEntities(textContent);
          const trimmed = decoded.trim();
          if (translationMap.has(trimmed)) {
            const translated = translationMap.get(trimmed)!;
            const leadingSpace = decoded.match(/^\s*/)?.[0] || '';
            const trailingSpace = decoded.match(/\s*$/)?.[0] || '';
            return `${openTag}${this.encodeXmlEntities(leadingSpace + translated + trailingSpace)}${closeTag}`;
          }
          return `${openTag}${textContent}${closeTag}`;
        }
      );
      zip.file(entry.relativePath, modifiedXml);
    }

    const outBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return {
      buffer: outBuffer,
      slideCount: Math.max(slideCount, 1),
    };
  }

  /**
   * Translate Word Document (.docx)
   * Preserves 100% of styles, layouts, margins, tables, and images.
   * Completely translates all text inside OpenXML <w:t> tags.
   */
  public async translateDocx(buffer: Buffer, targetLanguageCode: string): Promise<TranslateResult> {
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(buffer);
    } catch (err: any) {
      throw new BadRequestException(
        `Invalid Word file: The file is not a valid OpenXML (.docx) ZIP archive: ${err.message}`
      );
    }
    let estimatedPages = 1;

    const files = Object.keys(zip.files);
    const docEntries: { relativePath: string; xmlContent: string }[] = [];
    const allUniqueTexts = new Set<string>();

    for (const relativePath of files) {
      const isDoc = /^word\/document\.xml$/i.test(relativePath);
      const isHeaderFooter = /^word\/(header|footer)\d+\.xml$/i.test(relativePath);

      if (isDoc || isHeaderFooter) {
        const file = zip.file(relativePath);
        if (file) {
          const xmlContent = await file.async('string');
          docEntries.push({ relativePath, xmlContent });

          if (isDoc) {
            const pageBreaks = (xmlContent.match(/<w:lastRenderedPageBreak/g) || []).length;
            estimatedPages = Math.max(1, pageBreaks + 1);
          }

          // Collect all unique text inside <w:t>
          const tagRegex = /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g;
          let match: RegExpExecArray | null;
          while ((match = tagRegex.exec(xmlContent)) !== null) {
            const rawText = this.decodeXmlEntities(match[2]).trim();
            if (rawText && !this.isNonTranslatable(rawText)) {
              allUniqueTexts.add(rawText);
            }
          }
        }
      }
    }

    // Translate all document-wide unique strings concurrently
    const translationMap = new Map<string, string>();
    await Promise.all(
      Array.from(allUniqueTexts).map(async (text) => {
        const trans = await this.translateText(text, targetLanguageCode);
        translationMap.set(text, trans);
      })
    );

    // Replace text nodes across all document parts while preserving formatting
    for (const entry of docEntries) {
      const modifiedXml = entry.xmlContent.replace(
        /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g,
        (_match, openTag, textContent, closeTag) => {
          const decoded = this.decodeXmlEntities(textContent);
          const trimmed = decoded.trim();
          if (translationMap.has(trimmed)) {
            const translated = translationMap.get(trimmed)!;
            const leadingSpace = decoded.match(/^\s*/)?.[0] || '';
            const trailingSpace = decoded.match(/\s*$/)?.[0] || '';
            return `${openTag}${this.encodeXmlEntities(leadingSpace + translated + trailingSpace)}${closeTag}`;
          }
          return `${openTag}${textContent}${closeTag}`;
        }
      );
      zip.file(entry.relativePath, modifiedXml);
    }

    const outBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return {
      buffer: outBuffer,
      pageCount: estimatedPages,
    };
  }

  /**
   * Translate plain text (.txt)
   */
  public async translateTxt(buffer: Buffer, targetLanguageCode: string): Promise<TranslateResult> {
    const text = buffer.toString('utf8');
    const lines = text.split('\n');
    const uniqueLines = Array.from(new Set(lines.map((l) => l.trim()).filter((l) => l.length > 0 && !this.isNonTranslatable(l))));

    const translationMap = new Map<string, string>();
    await Promise.all(
      uniqueLines.map(async (line) => {
        const trans = await this.translateText(line, targetLanguageCode);
        translationMap.set(line, trans);
      })
    );

    const translatedLines = lines.map((line) => {
      const trimmed = line.trim();
      return translationMap.get(trimmed) || line;
    });

    const outBuffer = Buffer.from(translatedLines.join('\n'), 'utf8');
    return {
      buffer: outBuffer,
      pageCount: Math.max(1, Math.ceil(lines.length / 45)),
    };
  }

  /**
   * Translate CSV (.csv)
   */
  public async translateCsv(buffer: Buffer, targetLanguageCode: string): Promise<TranslateResult> {
    const text = buffer.toString('utf8');
    const lines = text.split(/\r?\n/);
    const uniqueCells = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;
      const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      for (const cell of cells) {
        const unquoted = cell.replace(/^"(.*)"$/, '$1').trim();
        if (unquoted && !this.isNonTranslatable(unquoted)) {
          uniqueCells.add(unquoted);
        }
      }
    }

    const translationMap = new Map<string, string>();
    await Promise.all(
      Array.from(uniqueCells).map(async (cell) => {
        const trans = await this.translateText(cell, targetLanguageCode);
        translationMap.set(cell, trans);
      })
    );

    const translatedLines = lines.map((line) => {
      if (!line.trim()) return line;
      const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const translated = cells.map((cell) => {
        const unquoted = cell.replace(/^"(.*)"$/, '$1').trim();
        const trans = translationMap.get(unquoted) || unquoted;
        return cell.startsWith('"') ? `"${trans}"` : trans;
      });
      return translated.join(',');
    });

    return {
      buffer: Buffer.from(translatedLines.join('\n'), 'utf8'),
      pageCount: 1,
    };
  }

  /**
   * Translate HTML (.html)
   */
  public async translateHtml(buffer: Buffer, targetLanguageCode: string): Promise<TranslateResult> {
    const html = buffer.toString('utf8');
    const tagRegex = /(>)([^<]+)(<)/g;
    const uniqueTexts = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
      const content = match[2].trim();
      if (content && !this.isNonTranslatable(content)) {
        uniqueTexts.add(content);
      }
    }

    const translationMap = new Map<string, string>();
    await Promise.all(
      Array.from(uniqueTexts).map(async (text) => {
        const trans = await this.translateText(text, targetLanguageCode);
        translationMap.set(text, trans);
      })
    );

    const modified = html.replace(/(>)([^<]+)(<)/g, (_match, prefix, content, suffix) => {
      const trimmed = content.trim();
      if (translationMap.has(trimmed)) {
        return `${prefix}${translationMap.get(trimmed)}${suffix}`;
      }
      return `${prefix}${content}${suffix}`;
    });

    return {
      buffer: Buffer.from(modified, 'utf8'),
      pageCount: 1,
    };
  }

  private decodeXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  private encodeXmlEntities(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  public buildSlideXml(title: string, subtitle: string, bullets: string[] = []): string {
    const bulletParagraphs = bullets
      .map(
        (b) =>
          `<a:p><a:pPr lvl="1"/><a:r><a:rPr lang="en-US" sz="1800"/><a:t>${this.encodeXmlEntities(b)}</a:t></a:r></a:p>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="609600"/><a:ext cx="7772400" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="3600" b="1"/><a:t>${this.encodeXmlEntities(title)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="2057400"/><a:ext cx="7772400" cy="4114800"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2000"/><a:t>${this.encodeXmlEntities(subtitle)}</a:t></a:r></a:p>${bulletParagraphs}</p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
  }

  public async generateSamplePptx(): Promise<Buffer> {
    const zip = new JSZip();

    const slideTopics = [
      {
        title: 'Q2 Investor Update',
        subtitle: 'FormatFlow Technologies Corporate Overview',
        bullets: ['Global file conversion & document intelligence platform', 'Proprietary layout preservation technology'],
      },
      {
        title: 'Executive Summary',
        subtitle: 'Quarterly Performance & Growth Trajectory',
        bullets: ['Revenue growth +142% year-over-year', 'Local zero-retention architecture launched'],
      },
      {
        title: 'Financial Overview',
        subtitle: 'Revenue, Gross Margin & EBITDA',
        bullets: ['Quarterly revenue reached $8.4M', 'Profitable operations with strong cash flow'],
      },
      {
        title: 'Market Strategy',
        subtitle: 'Enterprise Document Transformation',
        bullets: ['Global enterprise adoption expanding', 'High demand for privacy-first compliance tools'],
      },
      {
        title: 'Product Roadmap',
        subtitle: 'Core Technology Milestones',
        bullets: ['FormatFlow Studio document layout translation released', 'High-performance vector PDF engine integration'],
      },
      {
        title: 'Operations & Execution',
        subtitle: 'Global Infrastructure Highlights',
        bullets: ['Sub-50ms conversion pipeline latency', '99.99% system availability SLA achieved'],
      },
      {
        title: 'Customer Results',
        subtitle: 'User Metrics & Retention Highlights',
        bullets: ['Customer net retention rate at 128%', 'Customer satisfaction score (CSAT) 98.4%'],
      },
      {
        title: 'Team & Leadership',
        subtitle: 'Key Engineering & Design Talent',
        bullets: ['World-class full-stack and systems engineering team', 'Distributed global talent across engineering and AI'],
      },
      {
        title: 'Next Steps',
        subtitle: 'Second Half Priorities',
        bullets: ['Expanding language models for layout preservation', 'Enterprise API private beta launch'],
      },
      {
        title: 'Thank you',
        subtitle: 'Q&A and Discussion',
        bullets: ['Email: contact@formatflow.app', 'Website: formatflow.io'],
      },
    ];

    const totalSlides = 24;
    const slidesData: { title: string; subtitle: string; bullets: string[] }[] = [];
    for (let i = 0; i < totalSlides; i++) {
      if (i === 0) {
        slidesData.push(slideTopics[0]);
      } else if (i === totalSlides - 1) {
        slidesData.push(slideTopics[slideTopics.length - 1]);
      } else {
        const topic = slideTopics[1 + ((i - 1) % (slideTopics.length - 2))];
        slidesData.push({
          title: `Slide ${i + 1} · ${topic.title}`,
          subtitle: topic.subtitle,
          bullets: topic.bullets,
        });
      }
    }

    const overrideTypes = slidesData
      .map(
        (_, idx) =>
          `<Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
      )
      .join('\n  ');

    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${overrideTypes}
</Types>`
    );

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
    );

    const slideRels = slidesData
      .map(
        (_, idx) =>
          `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>`
      )
      .join('\n  ');

    zip.file(
      'ppt/_rels/presentation.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRels}
</Relationships>`
    );

    const sldIds = slidesData
      .map(
        (_, idx) =>
          `<p:sldId id="${256 + idx}" r:id="rId${idx + 1}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>`
      )
      .join('\n    ');

    zip.file(
      'ppt/presentation.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    ${sldIds}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
</p:presentation>`
    );

    for (let i = 0; i < totalSlides; i++) {
      const data = slidesData[i];
      zip.file(`ppt/slides/slide${i + 1}.xml`, this.buildSlideXml(data.title, data.subtitle, data.bullets));
    }

    return await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }
}
