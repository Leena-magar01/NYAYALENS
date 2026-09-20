export type Language = 'en' | 'hi' | 'mr';

export interface TranslationDictionary {
  brand: string;
  tagline: string;
  nav_dashboard: string;
  nav_upload: string;
  nav_analysis: string;
  nav_clauses: string;
  nav_ask: string;
  nav_compare: string;
  nav_timeline: string;
  nav_checklist: string;
  nav_brief: string;
  nav_history: string;
  nav_settings: string;
  nav_disclaimer: string;
  btn_get_started: string;
  btn_sign_in: string;
  btn_upload: string;
  btn_analyze: string;
  btn_ask: string;
  btn_compare: string;
  btn_export_pdf: string;
  safety_banner_title: string;
  safety_banner_desc: string;
  footer_rights: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brand: 'NyayaLens',
    tagline: 'AI Legal Information & Document Assistance Platform',
    nav_dashboard: 'Dashboard',
    nav_upload: 'Upload Document',
    nav_analysis: 'Document Analysis',
    nav_clauses: 'Clause Radar',
    nav_ask: 'Ask Document (RAG)',
    nav_compare: 'Document Comparison',
    nav_timeline: 'Legal Timeline',
    nav_checklist: 'Action Checklist',
    nav_brief: 'Lawyer Brief Generator',
    nav_history: 'Document History',
    nav_settings: 'Settings',
    nav_disclaimer: 'Legal Disclaimer',
    btn_get_started: 'Get Started Free',
    btn_sign_in: 'Sign In',
    btn_upload: 'Upload Document',
    btn_analyze: 'Run AI Analysis',
    btn_ask: 'Ask Question',
    btn_compare: 'Compare Documents',
    btn_export_pdf: 'Export Brief to PDF',
    safety_banner_title: 'Important Legal Safety Boundary & Disclosure',
    safety_banner_desc: 'NyayaLens provides legal information and document assistance for educational purposes only. It is NOT a law firm and does NOT provide binding legal advice.',
    footer_rights: 'All rights reserved.',
  },
  hi: {
    brand: 'न्याय-लेंस (NyayaLens)',
    tagline: 'एआई कानूनी जानकारी एवं दस्तावेज़ सहायता प्लेटफ़ॉर्म',
    nav_dashboard: 'डैशबोर्ड (Dashboard)',
    nav_upload: 'दस्तावेज़ अपलोड (Upload)',
    nav_analysis: 'दस्तावेज़ विश्लेषण (Analysis)',
    nav_clauses: 'धारा रडार (Clause Radar)',
    nav_ask: 'दस्तावेज़ से पूछें (Ask RAG)',
    nav_compare: 'दस्तावेज़ तुलना (Comparison)',
    nav_timeline: 'कानूनी समयरेखा (Timeline)',
    nav_checklist: 'कार्रवाई सूची (Checklist)',
    nav_brief: 'वकील ब्रीफ जनरेटर (Brief)',
    nav_history: 'दस्तावेज़ इतिहास (History)',
    nav_settings: 'सेटिंग्स (Settings)',
    nav_disclaimer: 'कानूनी अस्वीकरण (Disclaimer)',
    btn_get_started: 'मुफ्त शुरुआत करें',
    btn_sign_in: 'साइन इन करें',
    btn_upload: 'दस्तावेज़ अपलोड करें',
    btn_analyze: 'विश्लेषण चलाएं',
    btn_ask: 'प्रश्न पूछें',
    btn_compare: 'दस्तावेज़ों की तुलना करें',
    btn_export_pdf: 'पीडीएफ निर्यात करें',
    safety_banner_title: 'महत्वपूर्ण कानूनी सुरक्षा सीमा एवं प्रकटीकरण',
    safety_banner_desc: 'न्याय-लेंस केवल शैक्षिक उद्देश्यों के लिए कानूनी जानकारी और दस्तावेज़ सहायता प्रदान करता है। यह कोई लॉ फर्म नहीं है और कानूनी सलाह नहीं देता है।',
    footer_rights: 'सर्वाधिकार सुरक्षित।',
  },
  mr: {
    brand: 'न्याय-लेंस (NyayaLens)',
    tagline: 'एआय कायदेशीर माहिती आणि दस्तऐवज साहाय्य प्लॅटफॉर्म',
    nav_dashboard: 'डॅशबोर्ड (Dashboard)',
    nav_upload: 'दस्तऐवज अपलोड (Upload)',
    nav_analysis: 'दस्तऐवज विश्लेषण (Analysis)',
    nav_clauses: 'कलम रडार (Clause Radar)',
    nav_ask: 'दस्तऐवजाला विचारा (Ask RAG)',
    nav_compare: 'दस्तऐवज तुलना (Comparison)',
    nav_timeline: 'कायदेशीर कालरेषा (Timeline)',
    nav_checklist: 'कृती यादी (Checklist)',
    nav_brief: 'वकील ब्रीफ जनरेटर (Brief)',
    nav_history: 'दस्तऐवज इतिहास (History)',
    nav_settings: 'सेटिंग्ज (Settings)',
    nav_disclaimer: 'कायदेशीर अस्वीकरण (Disclaimer)',
    btn_get_started: 'मोफत सुरू करा',
    btn_sign_in: 'साइन इन करा',
    btn_upload: 'दस्तऐवज अपलोड करा',
    btn_analyze: 'विश्लेषण चालवा',
    btn_ask: 'प्रश्न विचारा',
    btn_compare: 'दस्तऐवजांची तुलना करा',
    btn_export_pdf: 'पीडीएफ एक्सपोर्ट करा',
    safety_banner_title: 'महत्त्वाची कायदेशीर सुरक्षा मर्यादा व स्पष्टीकरण',
    safety_banner_desc: 'न्याय-लेंस फक्त शैक्षणिक उद्देशांसाठी कायदेशीर माहिती आणि दस्तऐवज सहाय्य प्रदान करते. ही कोणतीही लॉ फर्म नाही आणि कायदेशीर सल्ला देत नाही.',
    footer_rights: 'सर्व हक्क राखीव.',
  },
};
