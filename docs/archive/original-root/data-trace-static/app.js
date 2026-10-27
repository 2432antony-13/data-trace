// Keep the verified DataTrace seed in this published script. Miaoda can deny
// standalone .mjs assets to anonymous visitors, so a runtime module import here
// would leave the otherwise public static demo unable to load or interact.
const crossIndustry = ['cross_industry'];

function record(item) {
  return { publicationDate: null, effectiveDate: null, currentVersionDate: null, parentExternalId: null, ...item };
}

export const regulations = [
  record({
    id: 'reg_hk_pdpo_cap486', externalId: 'hk:cap486', jurisdiction: 'HK',
    title: 'Personal Data (Privacy) Ordinance (Cap. 486)', shortTitle: 'PDPO (Cap. 486)',
    instrumentType: 'legislation', industries: crossIndustry,
    topics: ['collection', 'consent', 'data_subject_rights', 'security', 'retention', 'direct_marketing'],
    issuingBody: 'Hong Kong SAR', status: 'in_force', publicationDate: '1995-08-04', effectiveDate: '1996-12-20', currentVersionDate: '2022-10-01',
    summary: 'Hong Kong’s principal personal data law, covering collection, accuracy, retention, use, security, access and correction through six Data Protection Principles and specific statutory duties.',
    sourceUrl: 'https://www.elegislation.gov.hk/hk/cap486', sourceName: 'Hong Kong e-Legislation'
  }),
  record({
    id: 'reg_hk_breach_guidance_2023', externalId: 'hk:pcpd:guidance:breach:2023-06', jurisdiction: 'HK',
    title: 'Guidance on Data Breach Handling and Data Breach Notifications', shortTitle: 'Data Breach Guidance',
    instrumentType: 'regulator_guidance', industries: crossIndustry, topics: ['breach_notification', 'incident_response', 'security'],
    issuingBody: 'Privacy Commissioner for Personal Data', status: 'guidance_current', publicationDate: '2023-06-30', currentVersionDate: '2023-06-30', parentExternalId: 'hk:cap486',
    summary: 'PCPD guidance on breach response planning, containment, harm assessment, record keeping and voluntary notification to affected individuals and the regulator.',
    sourceUrl: 'https://www.pcpd.org.hk/english/resources_centre/publications/files/guidance_note_dbn_e.pdf', sourceName: 'PCPD Hong Kong'
  }),
  record({
    id: 'reg_hk_direct_marketing_guidance_2023', externalId: 'hk:pcpd:guidance:direct-marketing:2023-04', jurisdiction: 'HK',
    title: 'Guidance on Direct Marketing', shortTitle: 'Direct Marketing Guidance',
    instrumentType: 'regulator_guidance', industries: ['cross_industry', 'marketing'], topics: ['direct_marketing', 'consent', 'opt_out'],
    issuingBody: 'Privacy Commissioner for Personal Data', status: 'guidance_current', publicationDate: '2023-04-01', currentVersionDate: '2023-04-01', parentExternalId: 'hk:cap486',
    summary: 'Operational guidance for the PDPO Part VIA notice, consent, written confirmation, third-party transfer and opt-out requirements for direct marketing.',
    sourceUrl: 'https://www.pcpd.org.hk/english/resources_centre/publications/files/GN_DM_e.pdf', sourceName: 'PCPD Hong Kong'
  }),
  record({
    id: 'reg_hk_gba_scc_guidance_2023', externalId: 'hk:pcpd:guidance:gba-scc:2023-12', jurisdiction: 'HK',
    title: 'Guidance on Cross-boundary Data Transfer: Standard Contract for Cross-boundary Flow of Personal Information Within the Guangdong–Hong Kong–Macao Greater Bay Area (Mainland, Hong Kong)', shortTitle: 'GBA Standard Contract Guidance',
    instrumentType: 'regulator_guidance', industries: crossIndustry, topics: ['cross_border_transfer', 'standard_contracts'],
    issuingBody: 'Privacy Commissioner for Personal Data', status: 'guidance_current', publicationDate: '2023-12-13', currentVersionDate: '2023-12-13', parentExternalId: 'hk:cap486',
    summary: 'Guidance supporting voluntary use of the standard contract for personal information transfers between Mainland cities in the Greater Bay Area and Hong Kong.',
    sourceUrl: 'https://www.pcpd.org.hk/english/resources_centre/publications/files/standard_contract_gba.pdf', sourceName: 'PCPD Hong Kong'
  }),
  record({
    id: 'reg_hk_id_code_2016', externalId: 'hk:pcpd:code:hkid:2016-04', jurisdiction: 'HK',
    title: 'Code of Practice on the Identity Card Number and other Personal Identifiers', shortTitle: 'HKID Code of Practice',
    instrumentType: 'code_of_practice', industries: crossIndustry, topics: ['identity_data', 'collection', 'retention', 'security'],
    issuingBody: 'Privacy Commissioner for Personal Data', status: 'guidance_current', publicationDate: '1997-12-19', effectiveDate: '1997-12-19', currentVersionDate: '2016-04', parentExternalId: 'hk:cap486',
    summary: 'Statutory code governing collection, accuracy, retention, use and security of Hong Kong identity card numbers and copies and other personal identifiers.',
    sourceUrl: 'https://www.pcpd.org.hk/english/data_privacy_law/code_of_practices/files/picode_en.pdf', sourceName: 'PCPD Hong Kong'
  }),
  record({
    id: 'reg_hk_id_compliance_guide_2024', externalId: 'hk:pcpd:guide:hkid:2024-08-22', jurisdiction: 'HK',
    title: 'Code of Practice on the Identity Card Number and other Personal Identifiers: Compliance Guide for Data Users', shortTitle: 'HKID Compliance Guide',
    instrumentType: 'regulator_guidance', industries: crossIndustry, topics: ['identity_data', 'collection', 'retention', 'security'],
    issuingBody: 'Privacy Commissioner for Personal Data', status: 'guidance_current', publicationDate: '2024-08-22', currentVersionDate: '2024-08-22', parentExternalId: 'hk:pcpd:code:hkid:2016-04',
    summary: 'The 2024 explanatory compliance guide helps data users apply the separately maintained April 2016 HKID Code of Practice; it is not a revision of the Code itself.',
    sourceUrl: 'https://www.pcpd.org.hk/english/data_privacy_law/code_of_practices/files/compliance_guide_e.pdf', sourceName: 'PCPD Hong Kong'
  }),
  record({
    id: 'reg_hk_banking_cap155', externalId: 'hk:cap155', jurisdiction: 'HK',
    title: 'Banking Ordinance (Cap. 155)', shortTitle: 'Banking Ordinance', instrumentType: 'legislation',
    industries: ['financial_services', 'banking'], topics: ['customer_confidentiality', 'regulatory_disclosure', 'records'],
    issuingBody: 'Hong Kong SAR', status: 'in_force',
    summary: 'Hong Kong’s banking statute includes secrecy and disclosure controls for information obtained in the exercise of statutory supervisory functions.',
    sourceUrl: 'https://www.elegislation.gov.hk/hk/cap155', sourceName: 'Hong Kong e-Legislation'
  }),
  record({
    id: 'reg_hk_hkma_tmg1', externalId: 'hk:hkma:spm:tm-g-1', jurisdiction: 'HK',
    title: 'Supervisory Policy Manual TM-G-1: General Principles for Technology Risk Management', shortTitle: 'HKMA SPM TM-G-1', instrumentType: 'regulator_guidance',
    industries: ['financial_services', 'banking'], topics: ['cybersecurity', 'technology_risk', 'outsourcing', 'incident_response'],
    issuingBody: 'Hong Kong Monetary Authority', status: 'guidance_current', publicationDate: '2003-06-24', currentVersionDate: '2003-06-24',
    summary: 'HKMA supervisory expectations for governance, security controls, resilience, third-party technology risk and incident management at authorised institutions.',
    sourceUrl: 'https://brdr.hkma.gov.hk/eng/doc-ldg/spm/current/TM-G-1', sourceName: 'Hong Kong Monetary Authority'
  }),
  record({
    id: 'reg_hk_telecom_cap106', externalId: 'hk:cap106', jurisdiction: 'HK',
    title: 'Telecommunications Ordinance (Cap. 106)', shortTitle: 'Telecommunications Ordinance', instrumentType: 'legislation',
    industries: ['telecommunications'], topics: ['communications_data', 'lawful_access', 'licensing', 'network_security'],
    issuingBody: 'Hong Kong SAR', status: 'in_force',
    summary: 'The principal telecommunications statute establishes licensing, network and enforcement rules that frame operators’ handling and disclosure of communications-related information.',
    sourceUrl: 'https://www.elegislation.gov.hk/hk/cap106', sourceName: 'Hong Kong e-Legislation'
  }),
  record({
    id: 'reg_hk_uemo_cap593', externalId: 'hk:cap593', jurisdiction: 'HK',
    title: 'Unsolicited Electronic Messages Ordinance (Cap. 593)', shortTitle: 'UEMO (Cap. 593)', instrumentType: 'legislation',
    industries: ['telecommunications', 'marketing'], topics: ['electronic_marketing', 'address_harvesting', 'consent', 'opt_out'],
    issuingBody: 'Hong Kong SAR', status: 'in_force', publicationDate: '2007-06-01', effectiveDate: '2007-12-22',
    summary: 'Regulates commercial electronic messages, address harvesting, sender identification and unsubscribe facilities across email, SMS and other electronic channels.',
    sourceUrl: 'https://www.elegislation.gov.hk/hk/cap593', sourceName: 'Hong Kong e-Legislation'
  }),
  record({
    id: 'reg_sg_pdpa_2012', externalId: 'sg:act:26-2012', jurisdiction: 'SG',
    title: 'Personal Data Protection Act 2012', shortTitle: 'PDPA 2012', instrumentType: 'legislation', industries: crossIndustry,
    topics: ['accountability', 'consent', 'data_subject_rights', 'security', 'breach_notification', 'cross_border_transfer'],
    issuingBody: 'Parliament of Singapore', status: 'in_force', publicationDate: '2012-12-07', effectiveDate: '2013-01-02', currentVersionDate: '2025-12-05',
    summary: 'Singapore’s principal private-sector personal data law, covering accountability, consent, purpose, access and correction, care, breach notification, Do Not Call and enforcement.',
    sourceUrl: 'https://sso.agc.gov.sg/Act/PDPA2012', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_pdpr_2021', externalId: 'sg:sl:s63-2021', jurisdiction: 'SG',
    title: 'Personal Data Protection Regulations 2021', shortTitle: 'PDPR 2021', instrumentType: 'subsidiary_legislation', industries: crossIndustry,
    topics: ['access_correction', 'cross_border_transfer', 'deemed_consent', 'legitimate_interests'],
    issuingBody: 'Personal Data Protection Commission', status: 'in_force', publicationDate: '2021-01-29', effectiveDate: '2021-02-01', currentVersionDate: '2026-03-02', parentExternalId: 'sg:act:26-2012',
    summary: 'Subsidiary rules on access and correction requests, overseas transfers, deemed consent by notification, legitimate interests and related procedures.',
    sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S63-2021', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_breach_regs_2021', externalId: 'sg:sl:s64-2021', jurisdiction: 'SG',
    title: 'Personal Data Protection (Notification of Data Breaches) Regulations 2021', shortTitle: 'Breach Notification Regulations', instrumentType: 'subsidiary_legislation', industries: crossIndustry,
    topics: ['breach_notification', 'incident_response', 'significant_harm'],
    issuingBody: 'Personal Data Protection Commission', status: 'in_force', publicationDate: '2021-01-29', effectiveDate: '2021-02-01', currentVersionDate: '2024-10-15', parentExternalId: 'sg:act:26-2012',
    summary: 'Defines significant harm and significant scale and prescribes information required in notifications to the PDPC and affected individuals.',
    sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S64-2021', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_dnc_regs_2013', externalId: 'sg:sl:s709-2013', jurisdiction: 'SG',
    title: 'Personal Data Protection (Do Not Call Registry) Regulations 2013', shortTitle: 'DNC Regulations', instrumentType: 'subsidiary_legislation',
    industries: ['cross_industry', 'marketing', 'telecommunications'], topics: ['direct_marketing', 'do_not_call', 'telephone'],
    issuingBody: 'Minister for Communications and Information', status: 'in_force', publicationDate: '2013-11-26', effectiveDate: '2013-12-02', currentVersionDate: '2015-06-01', parentExternalId: 'sg:act:26-2012',
    summary: 'Rules for adding, removing and checking Singapore telephone numbers in the voice, text and fax Do Not Call Registers.',
    sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S709-2013', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_key_concepts_2021', externalId: 'sg:pdpc:guidance:key-concepts:2021-10', jurisdiction: 'SG',
    title: 'Advisory Guidelines on Key Concepts in the PDPA', shortTitle: 'Key Concepts Guidelines', instrumentType: 'regulator_guidance', industries: crossIndustry,
    topics: ['accountability', 'consent', 'data_intermediaries', 'breach_notification'], issuingBody: 'Personal Data Protection Commission', status: 'guidance_current',
    publicationDate: '2021-10-01', currentVersionDate: '2021-10-01', parentExternalId: 'sg:act:26-2012',
    summary: 'Authoritative regulator guidance on core concepts and obligations, including consent, purposes, data intermediaries and breach notification.',
    sourceUrl: 'https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Advisory-Guidelines/AG-on-Key-Concepts/Advisory-Guidelines-on-Key-Concepts-in-the-PDPA-1-Oct-2021.pdf', sourceName: 'PDPC Singapore'
  }),
  record({
    id: 'reg_sg_breach_guide_2021', externalId: 'sg:pdpc:guide:breach:2021-03', jurisdiction: 'SG',
    title: 'Guide on Managing and Notifying Data Breaches Under the PDPA', shortTitle: 'Data Breach Management Guide', instrumentType: 'regulator_guidance', industries: crossIndustry,
    topics: ['breach_notification', 'incident_response', 'security'], issuingBody: 'Personal Data Protection Commission', status: 'guidance_current',
    publicationDate: '2021-03-15', currentVersionDate: '2021-03-15', parentExternalId: 'sg:act:26-2012',
    summary: 'Practical breach-management guide covering preparation, assessment, mandatory notification criteria, timing and communication.',
    sourceUrl: 'https://www.pdpc.gov.sg/Help-and-Resources/2021/01/Data-Breach-Management-Guide', sourceName: 'PDPC Singapore'
  }),
  record({
    id: 'reg_sg_banking_act', externalId: 'sg:act:ba1970', jurisdiction: 'SG',
    title: 'Banking Act 1970', shortTitle: 'Banking Act', instrumentType: 'legislation', industries: ['financial_services', 'banking'],
    topics: ['customer_confidentiality', 'permitted_disclosure', 'records'], issuingBody: 'Parliament of Singapore', status: 'in_force', currentVersionDate: '2025-06-20',
    summary: 'Singapore’s banking statute includes the customer-information confidentiality regime and statutory gateways for permitted disclosure by banks and their officers.',
    sourceUrl: 'https://sso.agc.gov.sg/Act/BA1970', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_mas_trm_2021', externalId: 'sg:mas:guidelines:trm:2021', jurisdiction: 'SG',
    title: 'Technology Risk Management Guidelines', shortTitle: 'MAS TRM Guidelines', instrumentType: 'regulator_guidance', industries: ['financial_services'],
    topics: ['cybersecurity', 'technology_risk', 'data_security', 'outsourcing', 'incident_response'], issuingBody: 'Monetary Authority of Singapore', status: 'guidance_current',
    publicationDate: '2021-01-18', currentVersionDate: '2021-01-18',
    summary: 'MAS expectations for technology governance, secure development, cyber resilience, data protection controls, access management and third-party risk at financial institutions.',
    sourceUrl: 'https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines', sourceName: 'Monetary Authority of Singapore'
  }),
  record({
    id: 'reg_sg_mas_notice_644', externalId: 'sg:mas:notice:644', jurisdiction: 'SG',
    title: 'MAS Notice 644: Technology Risk Management', shortTitle: 'MAS Notice 644', instrumentType: 'regulator_guidance', industries: ['financial_services', 'banking'],
    topics: ['technology_risk', 'availability', 'incident_notification'], issuingBody: 'Monetary Authority of Singapore', status: 'guidance_current',
    summary: 'Binding notice for banks on critical-system availability, recovery objectives and notification of relevant IT security incidents to MAS.',
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-644', sourceName: 'Monetary Authority of Singapore'
  }),
  record({
    id: 'reg_sg_telecom_act', externalId: 'sg:act:ta1999', jurisdiction: 'SG',
    title: 'Telecommunications Act 1999', shortTitle: 'Telecommunications Act', instrumentType: 'legislation', industries: ['telecommunications'],
    topics: ['communications_data', 'licensing', 'network_security', 'lawful_access'], issuingBody: 'Parliament of Singapore', status: 'in_force', currentVersionDate: '2025-10-01',
    summary: 'The principal telecommunications statute frames licensing, network operation, enforcement and disclosure duties relevant to communications service providers.',
    sourceUrl: 'https://sso.agc.gov.sg/Act/TA1999', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_spam_control', externalId: 'sg:act:sca2007', jurisdiction: 'SG',
    title: 'Spam Control Act 2007', shortTitle: 'Spam Control Act', instrumentType: 'legislation', industries: ['telecommunications', 'marketing'],
    topics: ['electronic_marketing', 'address_harvesting', 'unsubscribe', 'sender_identification'], issuingBody: 'Parliament of Singapore', status: 'in_force', currentVersionDate: '2022-04-01',
    summary: 'Regulates unsolicited bulk commercial electronic messages, address-harvesting software, labelling and unsubscribe facilities.',
    sourceUrl: 'https://sso.agc.gov.sg/Act/SCA2007', sourceName: 'Singapore Statutes Online'
  }),
  record({
    id: 'reg_sg_imda_telecom_cyber', externalId: 'sg:imda:code:telecom-cybersecurity', jurisdiction: 'SG',
    title: 'Telecommunication Cybersecurity Code of Practice', shortTitle: 'Telecom Cybersecurity Code', instrumentType: 'code_of_practice', industries: ['telecommunications'],
    topics: ['cybersecurity', 'network_security', 'incident_response', 'resilience'], issuingBody: 'Infocomm Media Development Authority', status: 'guidance_current',
    summary: 'IMDA cybersecurity requirements and baseline controls for designated telecommunication licensees operating critical telecommunications infrastructure.',
    sourceUrl: 'https://www.imda.gov.sg/regulations-and-licences/regulations/codes-of-practice/codes-of-practice-and-guidelines---infocomm', sourceName: 'Infocomm Media Development Authority'
  })
];

// Human-readable locators record what was checked on each official source. They
// deliberately distinguish an instrument version date from a website's access
// or last-updated date, and say when no version date is asserted.
export const regulationVerification = Object.freeze({
  reg_hk_pdpo_cap486: 'Hong Kong e-Legislation: Cap. 486 title, commencement information and current consolidated text',
  reg_hk_breach_guidance_2023: 'PCPD PDF and 30 June 2023 media statement: exact guidance title and issue date',
  reg_hk_direct_marketing_guidance_2023: 'PCPD PDF cover: Guidance on Direct Marketing, 1 April 2023',
  reg_hk_gba_scc_guidance_2023: 'PCPD PDF and 13 December 2023 media statement: full title and issue date',
  reg_hk_id_code_2016: 'PCPD Code PDF: first revision April 2016; introduction records approval effective 19 December 1997',
  reg_hk_id_compliance_guide_2024: 'PCPD 22 August 2024 media statement: new Compliance Guide, separate from the April 2016 Code',
  reg_hk_banking_cap155: 'Hong Kong e-Legislation: Banking Ordinance (Cap. 155); no unverified current-version date asserted',
  reg_hk_hkma_tmg1: 'HKMA BRDR: TM-G-1 General principles for technology risk management; Issue Date 24 Jun 2003',
  reg_hk_telecom_cap106: 'Hong Kong e-Legislation: Telecommunications Ordinance (Cap. 106); no unverified current-version date asserted',
  reg_hk_uemo_cap593: 'Hong Kong e-Legislation and OFCA: UEMO (Cap. 593), fully commenced 22 December 2007',
  reg_sg_pdpa_2012: 'Singapore Statutes Online timeline: Personal Data Protection Act 2012; version 5 December 2025',
  reg_sg_pdpr_2021: 'Singapore Statutes Online timeline: Personal Data Protection Regulations 2021; S 86/2026 effective 2 March 2026',
  reg_sg_breach_regs_2021: 'Singapore Statutes Online timeline: Notification of Data Breaches Regulations 2021; version 15 October 2024',
  reg_sg_dnc_regs_2013: 'Singapore Statutes Online and S 331/2015: amendment effective 1 June 2015',
  reg_sg_key_concepts_2021: 'PDPC PDF cover: Advisory Guidelines on Key Concepts in the PDPA, revised 1 October 2021',
  reg_sg_breach_guide_2021: 'PDPC guide page: revised 15 March 2021',
  reg_sg_banking_act: 'Singapore Statutes Online timeline: Banking Act 1970; version 20 June 2025',
  reg_sg_mas_trm_2021: 'Official MAS PDF: Technology Risk Management Guidelines, January 2021; issued 18 January 2021',
  reg_sg_mas_notice_644: 'MAS Notice 644 page and official FAQ: Notice on Technology Risk Management for banks; no unverified revision date asserted',
  reg_sg_telecom_act: 'Singapore Statutes Online timeline: Telecommunications Act 1999; version 1 October 2025',
  reg_sg_spam_control: 'Singapore Statutes Online timeline: Spam Control Act 2007; version 1 April 2022',
  reg_sg_imda_telecom_cyber: 'IMDA codes page: Telecommunication Cybersecurity Code of Practice; no unverified issue or revision date asserted'
});

const articleRows = [
  ['art_hk_dpp1', 'hk:cap486:schedule1:dpp1', 'reg_hk_pdpo_cap486', 'DPP 1', 'Purpose and manner of collection', 'Personal data should be collected for a lawful purpose, and collection should be necessary, adequate but not excessive, lawful and fair.', ['collection', 'purpose', 'fairness']],
  ['art_hk_dpp2', 'hk:cap486:schedule1:dpp2', 'reg_hk_pdpo_cap486', 'DPP 2', 'Accuracy and retention', 'Data users should take practicable steps to keep personal data accurate and not retain it longer than necessary.', ['accuracy', 'retention', 'deletion']],
  ['art_hk_dpp3', 'hk:cap486:schedule1:dpp3', 'reg_hk_pdpo_cap486', 'DPP 3', 'Use of personal data', 'Personal data should not be used for a new purpose without prescribed consent unless a statutory exemption applies.', ['use', 'consent', 'purpose_limitation']],
  ['art_hk_dpp4', 'hk:cap486:schedule1:dpp4', 'reg_hk_pdpo_cap486', 'DPP 4', 'Security of personal data', 'A data user must take all practicable steps to protect personal data against unauthorised or accidental access, processing, erasure, loss or use.', ['security', 'breach', 'processor']],
  ['art_hk_dpp5', 'hk:cap486:schedule1:dpp5', 'reg_hk_pdpo_cap486', 'DPP 5', 'Openness', 'Data users should make generally available their personal-data policies and practices, data held and main purposes of use.', ['transparency', 'policy']],
  ['art_hk_dpp6', 'hk:cap486:schedule1:dpp6', 'reg_hk_pdpo_cap486', 'DPP 6', 'Access and correction', 'Data subjects should be able to ascertain whether a data user holds their data and request access and correction.', ['access', 'correction', 'data_subject_rights']],
  ['art_hk_35c', 'hk:cap486:s35c', 'reg_hk_pdpo_cap486', 's.35C', 'Use in direct marketing', 'A data user must give prescribed information and a response channel and obtain consent or an indication of no objection.', ['direct_marketing', 'consent', 'notice']],
  ['art_hk_64', 'hk:cap486:s64', 'reg_hk_pdpo_cap486', 's.64', 'Doxxing offences', 'Specified disclosures without consent are criminalised where the required intent or recklessness as to harm is present.', ['doxxing', 'offence', 'disclosure']],
  ['art_hk_bank_secrecy', 'hk:cap155:s120', 'reg_hk_banking_cap155', 's.120', 'Secrecy', 'Specified persons performing functions under the Banking Ordinance must preserve secrecy, subject to the statutory disclosure gateways.', ['secrecy', 'regulatory_disclosure']],
  ['art_hk_tmg1_controls', 'hk:hkma:spm:tm-g-1:controls', 'reg_hk_hkma_tmg1', 'Control domains', 'Technology-risk controls', 'Authorised institutions should maintain board-level governance, layered security, resilience and controls over outsourced technology services.', ['cybersecurity', 'outsourcing', 'resilience']],
  ['art_hk_uemo_unsub', 'hk:cap593:unsubscribe', 'reg_hk_uemo_cap593', 'Part 2 and Sch. 1', 'Sender and unsubscribe requirements', 'Commercial electronic messages must include prescribed sender information and a functional unsubscribe facility, subject to the statutory scope.', ['unsubscribe', 'sender_identification']],
  ['art_hk_telecom_data', 'hk:cap106:licence-information', 'reg_hk_telecom_cap106', 'Licence and information powers', 'Regulatory information controls', 'Telecommunications operators should map licence conditions and statutory information-gathering powers to their communications-data governance controls.', ['communications_data', 'regulatory_disclosure']],
  ['art_sg_11_12', 'sg:act:26-2012:ss11-12', 'reg_sg_pdpa_2012', 'ss.11–12', 'Accountability', 'An organisation must designate responsible individuals and develop and communicate policies and practices necessary to meet its obligations.', ['accountability', 'DPO', 'policies']],
  ['art_sg_13_20', 'sg:act:26-2012:ss13-20', 'reg_sg_pdpa_2012', 'ss.13–20', 'Consent, purpose and notification', 'Collection, use and disclosure generally require consent, appropriate purposes and prior notification, subject to exceptions.', ['consent', 'notice', 'purpose']],
  ['art_sg_21_22a', 'sg:act:26-2012:ss21-22a', 'reg_sg_pdpa_2012', 'ss.21–22A', 'Access, correction and preservation', 'Individuals may request access and correction while organisations must preserve relevant copies in specified circumstances.', ['access', 'correction', 'preservation']],
  ['art_sg_23_26', 'sg:act:26-2012:ss23-26', 'reg_sg_pdpa_2012', 'ss.23–26', 'Care of personal data', 'Organisations must address accuracy, protection, retention limitation and comparable protection for overseas transfers.', ['accuracy', 'security', 'retention', 'cross_border_transfer']],
  ['art_sg_26b_26d', 'sg:act:26-2012:ss26b-26d', 'reg_sg_pdpa_2012', 'ss.26B–26D', 'Notifiable data breaches', 'Organisations must assess breaches and notify the PDPC and affected individuals where statutory thresholds are met.', ['breach', 'notification', 'assessment']],
  ['art_sg_43_47', 'sg:act:26-2012:ss43-47', 'reg_sg_pdpa_2012', 'ss.43–47', 'Do Not Call duties', 'Senders must comply with register checking, identification and consent requirements for specified messages.', ['direct_marketing', 'do_not_call']],
  ['art_sg_pdpr_10', 'sg:sl:s63-2021:r10', 'reg_sg_pdpr_2021', 'reg.10', 'Requirements for overseas transfers', 'A transferring organisation must ensure comparable protection through legally enforceable obligations.', ['cross_border_transfer', 'comparable_protection']],
  ['art_sg_dbn_4', 'sg:sl:s64-2021:r4', 'reg_sg_breach_regs_2021', 'reg.4', 'Significant scale', 'A breach affecting at least 500 individuals is prescribed as a breach of significant scale.', ['breach', '500_individuals', 'notification']],
  ['art_sg_bank_conf', 'sg:act:ba1970:s47', 'reg_sg_banking_act', 's.47 and Third Schedule', 'Customer information confidentiality', 'Banks and their officers must protect customer information except through a permitted statutory disclosure gateway.', ['customer_confidentiality', 'permitted_disclosure']],
  ['art_sg_trm_data', 'sg:mas:guidelines:trm:data-security', 'reg_sg_mas_trm_2021', 'Security domains', 'Data security controls', 'Financial institutions should classify and protect data, control privileged access, monitor threats and manage third-party technology risk.', ['data_security', 'access_control', 'outsourcing']],
  ['art_sg_notice644_incident', 'sg:mas:notice:644:incident', 'reg_sg_mas_notice_644', 'Incident duties', 'Incident notification', 'Banks must meet critical-system availability and recovery requirements and notify MAS of specified incidents.', ['availability', 'recovery', 'incident_notification']],
  ['art_sg_spam_unsub', 'sg:act:sca2007:unsubscribe', 'reg_sg_spam_control', 'Unsubscribe rules', 'Unsubscribe facility', 'Covered electronic messages must meet labelling and unsubscribe requirements, and address-harvesting practices are restricted.', ['unsubscribe', 'address_harvesting']],
  ['art_sg_telecom_data', 'sg:act:ta1999:s78', 'reg_sg_telecom_act', 's.78', 'Power to require information', 'Telecommunications providers should govern information supplied under IMDA’s statutory information-gathering power and related licence duties.', ['communications_data', 'regulatory_disclosure']],
  ['art_sg_imda_controls', 'sg:imda:code:telecom-cybersecurity:controls', 'reg_sg_imda_telecom_cyber', 'Control domains', 'Cybersecurity controls', 'Designated licensees must implement governance, protection, detection, response and recovery controls for critical infrastructure.', ['cybersecurity', 'incident_response', 'resilience']]
];

export const articles = articleRows.map(([id, externalId, regulationId, provisionNumber, heading, textSummary, keywords]) => ({
  id, externalId, regulationId, provisionNumber, heading, textSummary, keywords,
  versionLabel: 'current_as_checked_2026-08-09', sourceAnchor: provisionNumber,
  sourceUrl: regulations.find((item) => item.id === regulationId)?.sourceUrl
}));

const updateRows = [
  { id: 'upd_hk_pdpo_commencement', externalId: 'hk:event:pdpo-commencement:1996-12-20', regulationId: 'reg_hk_pdpo_cap486', jurisdiction: 'HK', eventType: 'commencement', title: 'PDPO takes effect', summary: 'The principal provisions of Cap. 486 came into operation.', summaryZh: '香港《个人资料（私隐）条例》核心条文正式生效，建立覆盖全生命周期的数据保护框架。', eventDate: '1996-12-20', importance: 'high', sourceUrl: 'https://www.elegislation.gov.hk/hk/cap486', sourceName: 'Hong Kong e-Legislation', evidence: 'Cap. 486 commencement information' },
  { id: 'upd_hk_direct_marketing_2013', externalId: 'hk:event:direct-marketing:2013-04-01', regulationId: 'reg_hk_pdpo_cap486', jurisdiction: 'HK', eventType: 'amendment', title: 'Enhanced direct-marketing regime commences', summary: 'The Part VIA notice, consent and opt-out regime took effect.', summaryZh: '香港直销规则升级，企业须落实告知、同意及退出机制。', eventDate: '2013-04-01', importance: 'high', sourceUrl: 'https://www.pcpd.org.hk/english/resources_centre/publications/files/GN_DM_e.pdf', sourceName: 'PCPD Hong Kong', evidence: 'Guidance paragraph 1.1 footnote 1' },
  { id: 'upd_hk_doxxing_2021', externalId: 'hk:event:doxxing:2021-10-08', regulationId: 'reg_hk_pdpo_cap486', jurisdiction: 'HK', eventType: 'amendment', title: 'Doxxing amendments take effect', summary: 'New offences and PCPD investigation, prosecution and cessation-notice powers commenced.', summaryZh: '香港反起底修订生效，新增刑责及私隐专员执法权。', eventDate: '2021-10-08', importance: 'high', sourceUrl: 'https://www.pcpd.org.hk/english/data_privacy_law/amendments_2021/amendment_2021.html', sourceName: 'PCPD Hong Kong', evidence: 'PCPD amendment commencement page' },
  { id: 'upd_hk_breach_guide_2023', externalId: 'hk:event:breach-guidance:2023-06-30', regulationId: 'reg_hk_breach_guidance_2023', jurisdiction: 'HK', eventType: 'guidance_release', title: 'PCPD issues data-breach handling guidance', summary: 'PCPD issued guidance on preparation, response, documentation and voluntary notification.', summaryZh: '香港私隐专员发布泄露处置指引，强化预案、评估、记录及通知要求。', eventDate: '2023-06-30', importance: 'medium', sourceUrl: 'https://www.pcpd.org.hk/english/news_events/media_statements/press_20230630.html', sourceName: 'PCPD Hong Kong', evidence: 'PCPD media statement dated 30 June 2023' },
  { id: 'upd_hk_gba_scc_2023', externalId: 'hk:event:gba-scc-guidance:2023-12-13', regulationId: 'reg_hk_gba_scc_guidance_2023', jurisdiction: 'HK', eventType: 'guidance_release', title: 'GBA standard-contract guidance released', summary: 'PCPD published operational guidance for voluntary standard-contract transfers.', summaryZh: '大湾区个人信息跨境标准合同指引发布，为自愿采用合同工具提供操作框架。', eventDate: '2023-12-13', importance: 'medium', sourceUrl: 'https://www.pcpd.org.hk/english/news_events/media_statements/press_20231213.html', sourceName: 'PCPD Hong Kong', evidence: 'PCPD media statement dated 13 December 2023' },
  { id: 'upd_hk_hkid_guide_2024', externalId: 'hk:event:hkid-compliance-guide:2024-08-22', regulationId: 'reg_hk_id_compliance_guide_2024', jurisdiction: 'HK', eventType: 'guidance_revision', title: 'HKID Compliance Guide revised', summary: 'PCPD issued a new version of the explanatory Compliance Guide; the underlying Code remains the April 2016 revision.', summaryZh: '香港私隐专员于 2024 年 8 月更新身份证号码合规指南；《实务守则》本体仍为 2016 年 4 月修订版。', eventDate: '2024-08-22', importance: 'medium', sourceUrl: 'https://www.pcpd.org.hk/english/news_events/media_statements/press_20240822.html', sourceName: 'PCPD Hong Kong', evidence: 'PCPD media statement dated 22 August 2024' },
  { id: 'upd_hk_tmg1_issue_2003', externalId: 'hk:event:hkma-tmg1:2003-06-24', regulationId: 'reg_hk_hkma_tmg1', jurisdiction: 'HK', eventType: 'guidance_release', title: 'HKMA issues SPM TM-G-1', summary: 'HKMA issued the current TM-G-1 module on general principles for technology risk management.', summaryZh: '香港金管局发布 SPM TM-G-1 科技风险管理一般原则；官方当前模块列示发布日期为 2003 年 6 月 24 日。', eventDate: '2003-06-24', importance: 'high', sourceUrl: 'https://brdr.hkma.gov.hk/eng/doc-ldg/spm/current/TM-G-1', sourceName: 'Hong Kong Monetary Authority', evidence: 'BRDR Issue Date: 24 Jun 2003' },
  { id: 'upd_hk_uemo_2007', externalId: 'hk:event:uemo:2007-12-22', regulationId: 'reg_hk_uemo_cap593', jurisdiction: 'HK', eventType: 'commencement', title: 'UEMO fully commences', summary: 'Sender identification, do-not-call and unsubscribe controls came fully into force.', summaryZh: '香港商业电子讯息规则全面生效，覆盖发件人识别、拒收登记及退订机制。', eventDate: '2007-12-22', importance: 'medium', sourceUrl: 'https://www.ofca.gov.hk/en/consumer_focus/guide/others/uemo/index.html', sourceName: 'Office of the Communications Authority', evidence: 'OFCA states full commencement on 22 December 2007' },
  { id: 'upd_sg_core_2014', externalId: 'sg:event:data-protection-commencement:2014-07-02', regulationId: 'reg_sg_pdpa_2012', jurisdiction: 'SG', eventType: 'commencement', title: 'Core data-protection provisions commence', summary: 'The main PDPA data-protection obligations came fully into effect.', summaryZh: '新加坡 PDPA 核心数据保护义务全面生效。', eventDate: '2014-07-02', importance: 'high', sourceUrl: 'https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Advisory-Guidelines/AG-on-Key-Concepts/Advisory-Guidelines-on-Key-Concepts-in-the-PDPA-1-Oct-2021.pdf', sourceName: 'PDPC Singapore', evidence: 'Key Concepts Guidelines paragraph 24.1' },
  { id: 'upd_sg_2020_amendment', externalId: 'sg:event:pdpa-amendment:2021-02-01', regulationId: 'reg_sg_pdpa_2012', jurisdiction: 'SG', eventType: 'amendment', title: 'Major PDPA amendments commence', summary: 'Breach notification and enhanced accountability provisions commenced.', summaryZh: '新加坡 PDPA 重大修订生效，引入强制泄露通知等强化问责机制。', eventDate: '2021-02-01', importance: 'high', sourceUrl: 'https://www.pdpc.gov.sg/Help-and-Resources/2021/01/Data-Breach-Management-Guide', sourceName: 'PDPC Singapore', evidence: 'PDPC guide states enhanced PDPA came into force on 1 February 2021' },
  { id: 'upd_sg_breach_regs', externalId: 'sg:event:breach-regs:2021-02-01', regulationId: 'reg_sg_breach_regs_2021', jurisdiction: 'SG', eventType: 'commencement', title: 'Breach Notification Regulations commence', summary: 'Detailed harm, scale and notification-content rules took effect.', summaryZh: '新加坡数据泄露通知附属法规生效，明确重大损害、规模及通知内容标准。', eventDate: '2021-02-01', importance: 'high', sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S64-2021', sourceName: 'Singapore Statutes Online', evidence: 'SSO timeline: SL 64/2021 on 1 February 2021' },
  { id: 'upd_sg_penalties_2022', externalId: 'sg:event:financial-penalty:2022-10-01', regulationId: 'reg_sg_pdpa_2012', jurisdiction: 'SG', eventType: 'amendment', title: 'Enhanced financial-penalty framework commences', summary: 'Turnover-linked maximum penalties for larger organisations took effect.', summaryZh: '新加坡数据保护罚款框架升级，大型机构面临与营业额挂钩的最高罚款。', eventDate: '2022-10-01', importance: 'high', sourceUrl: 'https://www.pdpc.gov.sg/news-and-events/announcements/2022/09/amendments-to-enforcement-under-the-personal-data-protection-act-in-updated-advisory-guidelines-and-guide', sourceName: 'PDPC Singapore', evidence: 'PDPC announcement: enforcement amendments take effect on 1 October 2022' },
  { id: 'upd_sg_breach_regs_2024', externalId: 'sg:event:breach-regs-amendment:2024-10-15', regulationId: 'reg_sg_breach_regs_2021', jurisdiction: 'SG', eventType: 'amendment', title: 'Breach Notification Regulations amended by S 800/2024', summary: 'S 800/2024 amended prescribed-data entries in the Schedule.', summaryZh: '新加坡 S 800/2024 修订泄露通知规则附表中的法定个人资料项目。', eventDate: '2024-10-15', importance: 'medium', sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S64-2021?DocDate=20241014', sourceName: 'Singapore Statutes Online', evidence: 'SSO timeline: S 800/2024 effective 15 October 2024' },
  { id: 'upd_sg_pdpa_2025', externalId: 'sg:event:pdpa-amendment:2025-12-05', regulationId: 'reg_sg_pdpa_2012', jurisdiction: 'SG', eventType: 'amendment', title: 'PDPA amended by Act 19 of 2025', summary: 'Singapore Statutes Online records Act 19 of 2025 in the legislative timeline.', summaryZh: '新加坡 PDPA 经 2025 年第 19 号法令修订，企业应核对现行条文版本。', eventDate: '2025-12-05', importance: 'medium', sourceUrl: 'https://sso.agc.gov.sg/Act/PDPA2012?ValidDate=20251205', sourceName: 'Singapore Statutes Online', evidence: 'SSO timeline: Act 19 of 2025 effective 5 December 2025' },
  { id: 'upd_sg_mas_trm_2021', externalId: 'sg:event:mas-trm:2021-01-18', regulationId: 'reg_sg_mas_trm_2021', jurisdiction: 'SG', eventType: 'guidance_revision', title: 'MAS issues revised Technology Risk Management Guidelines', summary: 'The revision strengthens cyber resilience, security and third-party risk expectations.', summaryZh: '新加坡金管局修订科技风险指引，强化网络韧性、数据安全与第三方风险要求。', eventDate: '2021-01-18', importance: 'high', sourceUrl: 'https://www.mas.gov.sg/-/media/MAS/Regulations-and-Financial-Stability/Regulatory-and-Supervisory-Framework/Risk-Management/TRM-Guidelines-18-January-2021.pdf', sourceName: 'Monetary Authority of Singapore', evidence: 'Official MAS PDF filename and January 2021 edition' },
  { id: 'upd_sg_pdpr_2026', externalId: 'sg:event:pdpr-amendment:2026-03-02', regulationId: 'reg_sg_pdpr_2021', jurisdiction: 'SG', eventType: 'amendment', title: 'PDPR 2021 amended by S 86/2026', summary: 'S 86/2026 updated regulation 12 to recognise Global CBPR and Privacy Recognition for Processors certifications.', summaryZh: '新加坡 S 86/2026 修订 PDPR 第 12 条，纳入全球跨境隐私规则及处理者认证体系。', eventDate: '2026-03-02', importance: 'medium', sourceUrl: 'https://sso.agc.gov.sg/SL/PDPA2012-S63-2021?ProvIds=pr12-.', sourceName: 'Singapore Statutes Online', evidence: 'SSO timeline and annotation: S 86/2026 effective 2 March 2026' }
];

export const updates = updateRows.map((row) => {
  const { id, externalId, regulationId, jurisdiction, eventType, title, summary, summaryZh, eventDate, importance, sourceUrl, sourceName, evidence } = row;
  const regulation = regulations.find((item) => item.id === regulationId);
  return {
    id, externalId, regulationId, jurisdiction, eventType, title, summary, summaryZh, eventDate, importance,
    industries: regulation?.industries ?? crossIndustry, topics: regulation?.topics ?? [],
    sourceUrl, sourceName, evidence
  };
});

export const deprecatedSeedRecords = {
  regulationExternalIds: ['hk:ord:32-2021', 'hk:pcpd:code:hkid:2024-08'],
  updateExternalIds: ['hk:event:hkid-code:2024-08', 'hk:event:hkma-tmg1:2024-11-05', 'sg:event:imda-telecom-cyber:2022-10-31']
};

const state = {
  regulations: [], updates: [], jurisdiction: '', industry: '', topic: '', type: '', query: '', timelineJurisdiction: '',
  language: localStorage.getItem('dataTraceLanguage') || 'en',
  subscriber: JSON.parse(localStorage.getItem('dataTraceSubscriber') || 'null')
};

const messages = {
  en: {
    'nav.home': 'Radar', 'nav.library': 'Library', 'nav.timeline': 'Timeline', 'nav.subscribe': 'Subscribe ↗',
    'hero.title': 'Trace every<br><em>regulatory shift</em><br>to its source.',
    'hero.body': 'Regulatory intelligence for cross-border legal and privacy teams—connecting primary sources, obligations, amendments and delivery in one auditable data chain.',
    'hero.library': 'Explore the library', 'hero.timeline': 'Review latest changes',
    'stats.records': 'instruments', 'stats.obligations': 'obligations', 'stats.events': 'events',
    'latest.title': 'Latest regulatory signals', 'latest.all': 'Full timeline →',
    'coverage.title': 'Jurisdiction coverage', 'coverage.hk': 'Hong Kong', 'coverage.sg': 'Singapore',
    'coverage.source': '<b>Source-verifiable</b><br>Every record retains its authority, primary link, version date and content fingerprint.',
    'library.title': 'Regulation is more than a PDF.', 'library.body': 'Filter by jurisdiction, industry and topic; open any record for structured obligations, version data and the authoritative source.',
    'library.search': 'Search rules, duties or authorities', 'filter.all': 'All', 'filter.allIndustries': 'All industries', 'filter.allTopics': 'All topics', 'filter.allTypes': 'All instrument types',
    'type.legislation': 'Primary legislation', 'type.subsidiary_legislation': 'Subsidiary legislation', 'type.regulator_guidance': 'Regulatory guidance', 'type.code_of_practice': 'Code of practice',
    'timeline.title': 'Regulatory change timeline', 'timeline.body': 'Every commencement, amendment and guidance event links back to its instrument and official source.',
    'impact.high': 'High impact', 'impact.medium': 'Medium impact', 'impact.low': 'Routine',
    'subscribe.title': 'Do not leave change<br>inside the browser.', 'subscribe.body': 'Choose a fixed jurisdiction plan and delivery mode. Daily briefings run at 08:00 Beijing time; high-impact alerts are prepared immediately.',
    'subscribe.settings': 'Subscription settings', 'subscribe.email': 'Work email', 'subscribe.delivery': 'Delivery',
    'subscribe.daily': 'Daily briefing', 'subscribe.dailyNote': 'Every day at 08:00 Beijing time', 'subscribe.alert': 'Regulatory update alert', 'subscribe.alertNote': 'Immediate delivery for new or amended rules',
    'subscribe.plan': 'Jurisdiction plan', 'plan.hk': 'Hong Kong only', 'plan.sg': 'Singapore only', 'plan.all': 'All jurisdictions',
    'subscribe.save': 'Save subscription', 'subscribe.fine': 'Static demo: settings stay only in this browser. No email is sent and no online subscriber record is created.', 'subscribe.unsubscribe': 'Unsubscribe',
    'footer.note': 'Hong Kong + Singapore pilot · source check 2026-08-09<br>Tracking information only; not legal advice.'
  },
  zh: {
    'nav.home': '雷达', 'nav.library': '法规库', 'nav.timeline': '更新线', 'nav.subscribe': '订阅信号 ↗',
    'hero.title': '让每一次<br><em>规则变化</em><br>留下轨迹。', 'hero.body': '面向出海企业法务与数据合规律师的法规信号台，把原始法源、条文义务、修订事件和订阅触达收拢到一条可追溯的数据链。',
    'hero.library': '进入法规库', 'hero.timeline': '查看最新变化', 'stats.records': '法规与指南', 'stats.obligations': '结构化义务', 'stats.events': '历史事件',
    'latest.title': '最新监管信号', 'latest.all': '完整时间线 →', 'coverage.title': '法域覆盖', 'coverage.hk': '香港', 'coverage.sg': '新加坡',
    'coverage.source': '<b>来源可核验</b><br>每条记录保留发布机关、原文链接、版本日与内容指纹。',
    'library.title': '法规，不只是一份 PDF。', 'library.body': '按法域、行业、主题与文书层级定位规则；打开记录即可查看结构化义务、版本信息和权威原文。',
    'library.search': '搜索法规、义务或发布机关', 'filter.all': '全部', 'filter.allIndustries': '全部行业', 'filter.allTopics': '全部主题', 'filter.allTypes': '全部文书类型',
    'type.legislation': '主要立法', 'type.subsidiary_legislation': '附属法规', 'type.regulator_guidance': '监管指引', 'type.code_of_practice': '实务守则',
    'timeline.title': '规则更新线', 'timeline.body': '从生效、修订到指引发布，每个事件均回链至对应法规和官方来源。',
    'impact.high': '高影响', 'impact.medium': '中影响', 'impact.low': '常规更新',
    'subscribe.title': '别让变化<br>停在浏览器里。', 'subscribe.body': '选择固定法域方案与触达方式。每日简报在北京时间 8:00 生成，高影响修订与新规即时生成 alert。',
    'subscribe.settings': '订阅设置', 'subscribe.email': '工作邮箱', 'subscribe.delivery': '接收内容',
    'subscribe.daily': '每日简报', 'subscribe.dailyNote': '北京时间每天 8:00', 'subscribe.alert': '法规更新 Alert', 'subscribe.alertNote': '新规或修订即时触达',
    'subscribe.plan': '法域方案', 'plan.hk': '仅香港', 'plan.sg': '仅新加坡', 'plan.all': '全部',
    'subscribe.save': '保存订阅', 'subscribe.fine': '静态演示：设置仅保存在当前浏览器，不会发送邮件，也不会创建线上订阅记录。', 'subscribe.unsubscribe': '取消订阅',
    'footer.note': '香港 + 新加坡试点 · 来源核验于 2026-08-09<br>信息仅用于法规追踪，不构成法律意见。'
  }
};

const typeLabels = {
  en: { legislation: 'Primary legislation', subsidiary_legislation: 'Subsidiary legislation', regulator_guidance: 'Regulatory guidance', code_of_practice: 'Code of practice' },
  zh: { legislation: '主要立法', subsidiary_legislation: '附属法规', regulator_guidance: '监管指引', code_of_practice: '实务守则' }
};
const eventLabels = {
  en: { enactment: 'Enactment', commencement: 'Commencement', amendment: 'Amendment', guidance_release: 'Guidance release', guidance_revision: 'Guidance revision', source_refresh: 'Source refresh' },
  zh: { enactment: '颁布', commencement: '生效', amendment: '修订', guidance_release: '指引发布', guidance_revision: '指引修订', source_refresh: '来源刷新' }
};
const taxonomyLabels = {
  cross_industry: ['Cross-industry', '跨行业'], financial_services: ['Financial services', '金融服务'], banking: ['Banking', '银行'], telecommunications: ['Telecommunications', '电信'], marketing: ['Marketing', '营销'],
  collection: ['Collection', '收集'], consent: ['Consent', '同意'], data_subject_rights: ['Data subject rights', '数据主体权利'], security: ['Security', '安全'], retention: ['Retention', '留存'], direct_marketing: ['Direct marketing', '直销'], breach_notification: ['Breach notification', '泄露通知'], incident_response: ['Incident response', '事件响应'], cross_border_transfer: ['Cross-border transfer', '跨境传输'], cybersecurity: ['Cybersecurity', '网络安全'], technology_risk: ['Technology risk', '科技风险'], outsourcing: ['Outsourcing', '外包'], customer_confidentiality: ['Customer confidentiality', '客户信息保密'], communications_data: ['Communications data', '通信数据'], electronic_marketing: ['Electronic marketing', '电子营销'], network_security: ['Network security', '网络安全']
};

function t(key) { return messages[state.language][key] || key; }
function label(value) { const pair = taxonomyLabels[value]; return pair ? pair[state.language === 'en' ? 0 : 1] : value.replaceAll('_', ' '); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }

let staticSubscriber = state.subscriber;

// This public fallback retains the reviewed regulation seed when a cloud
// full-stack deployment is unavailable. Subscription choices remain local to
// the visitor's browser and never trigger an email delivery from this demo.
async function api(path, options = {}) {
  const url = new URL(path, location.origin);
  const method = String(options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const list = regulations.filter((item) => {
    const matches = (key, values) => !url.searchParams.get(key) || values.includes(url.searchParams.get(key));
    const needle = (url.searchParams.get('q') || '').toLowerCase();
    return (!url.searchParams.get('jurisdiction') || item.jurisdiction === url.searchParams.get('jurisdiction'))
      && (!url.searchParams.get('type') || item.instrumentType === url.searchParams.get('type'))
      && matches('industry', item.industries) && matches('topic', item.topics)
      && (!needle || [item.title, item.shortTitle, item.summary, item.issuingBody, ...item.industries, ...item.topics].join(' ').toLowerCase().includes(needle));
  });
  if (method === 'GET' && url.pathname === '/api/health') return { status: 'ok', regulations: regulations.length, articles: articles.length, updates: updates.length, subscribers: 0 };
  if (method === 'GET' && url.pathname === '/api/taxonomy') return { data: { industries: [...new Set(regulations.flatMap((item) => item.industries))].sort(), topics: [...new Set(regulations.flatMap((item) => item.topics))].sort() } };
  if (method === 'GET' && url.pathname === '/api/regulations') return { data: list, total: list.length };
  if (method === 'GET' && url.pathname.startsWith('/api/regulations/')) {
    const item = regulations.find((entry) => entry.id === decodeURIComponent(url.pathname.split('/').pop()));
    if (!item) throw new Error('Regulation not found.');
    return { data: { ...item, sourceCheckedAt: '2026-08-09T00:00:00.000Z', articles: articles.filter((entry) => entry.regulationId === item.id) } };
  }
  if (method === 'GET' && url.pathname === '/api/updates') return { data: [...updates].sort((a, b) => b.eventDate.localeCompare(a.eventDate)), total: updates.length };
  if (method === 'GET' && url.pathname === '/api/briefings/preview') {
    const recent = [...updates].sort((a, b) => b.eventDate.localeCompare(a.eventDate)).slice(0, 5);
    return { data: { subject: `Data Trace Daily · ${new Date().toISOString().slice(0, 10)}`, schedule: { label: '08:00 Beijing time' }, text: recent.map((item) => `${item.eventDate} · ${item.jurisdiction} · ${item.title}\n中文一句话摘要（AI）：${item.summaryZh}\n${item.sourceUrl}`).join('\n\n') } };
  }
  if (url.pathname === '/api/subscribers' && method === 'POST') {
    staticSubscriber = { id: `static_${Date.now()}`, email: body.email, dailyBriefing: body.dailyBriefing, updateAlert: body.updateAlert, jurisdictionPlan: body.jurisdictionPlan, active: true, updatedAt: new Date().toISOString() };
    return { data: staticSubscriber, manageToken: 'static-demo' };
  }
  if (url.pathname.startsWith('/api/subscribers/') && method === 'GET' && staticSubscriber) return { data: staticSubscriber };
  if (url.pathname.startsWith('/api/subscribers/') && method === 'PATCH' && staticSubscriber) {
    staticSubscriber = { ...staticSubscriber, ...body, updatedAt: new Date().toISOString() };
    return { data: staticSubscriber };
  }
  if (url.pathname.startsWith('/api/subscribers/') && method === 'DELETE' && staticSubscriber) {
    staticSubscriber = { ...staticSubscriber, active: false, updatedAt: new Date().toISOString() };
    return { data: staticSubscriber };
  }
  throw new Error(state.language === 'en' ? 'This static demo supports browsing the verified DataTrace seed.' : '此静态演示版支持浏览已核验的 DataTrace 数据。');
}

function applyTranslations() {
  document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  const toggle = document.querySelector('#language-toggle');
  toggle.textContent = state.language === 'en' ? '中文' : 'EN';
  toggle.setAttribute('aria-label', state.language === 'en' ? '切换到中文' : 'Switch to English');
  if (state.updates.length) { renderLatest(); renderTimeline(); }
  if (state.regulations.length) renderRegulations(state.regulations.length);
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-GB' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${value}T00:00:00Z`)) : '—';
}
function skeletons(count = 3) { return Array.from({ length: count }, () => '<div class="skeleton"></div>').join(''); }

function route() {
  const target = (location.hash || '#home').slice(1).split(/[/?]/)[0];
  const view = document.querySelector(`[data-view="${target}"]`) || document.querySelector('[data-view="home"]');
  document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item === view));
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === view.dataset.view));
  document.querySelector('.topbar nav').classList.remove('open');
  document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (target === 'subscribe') restoreFromEmailLink();
}

async function loadHealth() {
  const data = await api('/api/health');
  document.querySelector('#stat-regulations').textContent = data.regulations;
  document.querySelector('#stat-articles').textContent = data.articles;
  document.querySelector('#stat-updates').textContent = data.updates;
}

async function loadTaxonomy() {
  const { data } = await api('/api/taxonomy');
  const industry = document.querySelector('#industry-filter');
  const topic = document.querySelector('#topic-filter');
  industry.replaceChildren(new Option(t('filter.allIndustries'), ''), ...data.industries.map((value) => new Option(label(value), value)));
  topic.replaceChildren(new Option(t('filter.allTopics'), ''), ...data.topics.map((value) => new Option(label(value), value)));
}

async function loadUpdates() {
  const payload = await api('/api/updates'); state.updates = payload.data; renderLatest(); renderTimeline();
}
function renderLatest() {
  document.querySelector('#latest-updates').innerHTML = state.updates.slice(0, 5).map((item) => `
    <article class="signal-item" data-update-regulation="${escapeHtml(item.regulationId || '')}" tabindex="0">
      <time>${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time><span class="signal-tag">${escapeHtml(item.jurisdiction)}</span>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(state.language === 'zh' ? item.summaryZh : item.summary)}</p></div><i>↗</i>
    </article>`).join('');
}
function renderTimeline() {
  const items = state.timelineJurisdiction ? state.updates.filter((item) => item.jurisdiction === state.timelineJurisdiction) : state.updates;
  document.querySelector('#timeline-list').innerHTML = items.map((item) => `
    <article class="timeline-item ${escapeHtml(item.importance)}"><time class="timeline-date">${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time>
      <div class="timeline-content"><div class="timeline-meta"><span>${escapeHtml(item.jurisdiction)}</span><span>${escapeHtml(eventLabels[state.language][item.eventType] || item.eventType)}</span></div>
      <h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(state.language === 'zh' ? item.summaryZh : item.summary)}</p>
      <div class="keywords">${item.industries.map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <a class="source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceName)} · ${state.language === 'en' ? 'official source' : '查看原文'} ↗</a></div>
    </article>`).join('') || `<div class="empty-state">${state.language === 'en' ? 'No updates for this jurisdiction.' : '该法域暂无更新记录。'}</div>`;
}

async function loadRegulations() {
  const params = new URLSearchParams();
  for (const key of ['jurisdiction', 'industry', 'topic', 'type']) if (state[key]) params.set(key, state[key]);
  if (state.query) params.set('q', state.query);
  const payload = await api(`/api/regulations?${params}`); state.regulations = payload.data; renderRegulations(payload.total);
}
function renderRegulations(total) {
  document.querySelector('#result-count').textContent = state.language === 'en' ? `${total} verified records` : `${total} 条已核验记录`;
  document.querySelector('#regulation-grid').innerHTML = state.regulations.map((item, index) => `
    <article class="reg-card ${index === 0 && !state.query && !state.type && !state.industry && !state.topic ? 'featured' : ''}" data-regulation-id="${escapeHtml(item.id)}" data-code="${escapeHtml(item.jurisdiction)}" tabindex="0">
      <div class="card-top"><span class="jurisdiction-badge">${escapeHtml(item.jurisdiction)}</span><span class="card-type">${escapeHtml(typeLabels[state.language][item.instrumentType] || item.instrumentType)}</span></div>
      <h2>${escapeHtml(item.shortTitle)}</h2><p>${escapeHtml(item.summary)}</p>
      <div class="keywords">${[...item.industries, ...item.topics.slice(0, 2)].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="card-bottom"><span>${state.language === 'en' ? 'Version' : '版本'} ${escapeHtml(item.currentVersionDate || item.effectiveDate || '—')}</span><b>${state.language === 'en' ? 'Open record' : '打开记录'} ↗</b></div>
    </article>`).join('') || `<div class="empty-state"><b>${state.language === 'en' ? 'No matching records' : '没有匹配记录'}</b><p>${state.language === 'en' ? 'Try fewer keywords or change a classification filter.' : '请减少关键词或切换分类筛选。'}</p></div>`;
}

async function openRegulation(id) {
  if (!id) return;
  const overlay = document.querySelector('#detail-overlay'); const content = document.querySelector('#detail-content');
  overlay.hidden = false; document.body.style.overflow = 'hidden'; content.innerHTML = skeletons(4);
  try {
    const { data } = await api(`/api/regulations/${encodeURIComponent(id)}`);
    content.innerHTML = `<div class="detail-kicker"><span>${escapeHtml(data.jurisdiction)}</span><span>${escapeHtml(typeLabels[state.language][data.instrumentType] || data.instrumentType)}</span><span>${escapeHtml(data.status)}</span></div>
      <h1 id="detail-title">${escapeHtml(data.title)}</h1><p class="detail-summary">${escapeHtml(data.summary)}</p>
      <div class="keywords">${[...data.industries, ...data.topics].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="detail-facts"><div><small>${state.language === 'en' ? 'Authority' : '发布机关'}</small><b>${escapeHtml(data.issuingBody)}</b></div><div><small>${state.language === 'en' ? 'Current version' : '当前版本'}</small><b>${escapeHtml(data.currentVersionDate || '—')}</b></div><div><small>${state.language === 'en' ? 'Effective' : '生效日期'}</small><b>${escapeHtml(formatDate(data.effectiveDate))}</b></div><div><small>${state.language === 'en' ? 'Source checked' : '来源核验'}</small><b>${escapeHtml(data.sourceCheckedAt.slice(0, 10))}</b></div></div>
      <section class="detail-section"><h2>${state.language === 'en' ? 'Structured obligations' : '结构化义务'}</h2>${data.articles.length ? data.articles.map((article) => `<article class="article"><h3><span>${escapeHtml(article.provisionNumber)}</span>${escapeHtml(article.heading)}</h3><p>${escapeHtml(article.textSummary)}</p><div class="keywords">${article.keywords.map((keyword) => `<span>${escapeHtml(label(keyword))}</span>`).join('')}</div></article>`).join('') : `<p>${state.language === 'en' ? 'Tracked at instrument level; provision decomposition is pending.' : '当前按文书级追踪，条文拆分待补。'}</p>`}</section>
      <a class="button primary official-button" href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener">${state.language === 'en' ? 'Open' : '前往'} ${escapeHtml(data.sourceName)} <span>↗</span></a>`;
    document.querySelector('#detail-close').focus();
  } catch (error) { content.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}
function closeDetail() { document.querySelector('#detail-overlay').hidden = true; document.body.style.overflow = ''; }

async function loadBriefingPreview() {
  const { data } = await api('/api/briefings/preview');
  document.querySelector('#briefing-preview-body').textContent = `${data.subject}\n${data.schedule.label}\n\n${data.text}`;
}
function restoreSubscription() {
  if (!state.subscriber) return;
  const form = document.querySelector('#subscription-form');
  form.querySelector('#email').value = state.subscriber.email; form.querySelector('#email').disabled = true;
  form.querySelector('#daily-briefing').checked = state.subscriber.dailyBriefing; form.querySelector('#update-alert').checked = state.subscriber.updateAlert;
  const plan = form.querySelector(`[name="jurisdiction-plan"][value="${state.subscriber.jurisdictionPlan || 'ALL'}"]`); if (plan) plan.checked = true;
  document.querySelector('#manage-actions').hidden = false; document.querySelector('#subscriber-id').textContent = state.subscriber.id;
}
async function restoreFromEmailLink() {
  const query = location.hash.split('?')[1]; if (!query) return;
  const params = new URLSearchParams(query); const subscriber = params.get('subscriber'); const token = params.get('token');
  if (!subscriber || !token || state.subscriber?.id === subscriber) return;
  const feedback = document.querySelector('#subscription-feedback');
  try {
    const { data } = await api(`/api/subscribers/${encodeURIComponent(subscriber)}?token=${encodeURIComponent(token)}`);
    state.subscriber = { ...data, manageToken: token }; localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber)); restoreSubscription();
    feedback.className = 'feedback success'; feedback.textContent = params.get('action') === 'unsubscribe' ? (state.language === 'en' ? 'Subscription loaded. Use Unsubscribe below to confirm.' : '已载入订阅，请点击下方“取消订阅”确认。') : (state.language === 'en' ? 'Subscription loaded from your private link.' : '已通过专属链接载入订阅。');
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}
function formPreferences() {
  return { dailyBriefing: document.querySelector('#daily-briefing').checked, updateAlert: document.querySelector('#update-alert').checked, jurisdictionPlan: document.querySelector('[name="jurisdiction-plan"]:checked')?.value };
}
async function submitSubscription(event) {
  event.preventDefault(); const feedback = document.querySelector('#subscription-feedback'); const button = event.currentTarget.querySelector('.submit-button');
  feedback.className = 'feedback'; feedback.textContent = state.language === 'en' ? 'Saving…' : '正在保存…'; button.disabled = true;
  try {
    const preferences = formPreferences(); let payload;
    if (state.subscriber) {
      payload = await api(`/api/subscribers/${state.subscriber.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-manage-token': state.subscriber.manageToken }, body: JSON.stringify(preferences) });
      state.subscriber = { ...payload.data, manageToken: state.subscriber.manageToken };
    } else {
      payload = await api('/api/subscribers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: document.querySelector('#email').value, ...preferences }) });
      state.subscriber = { ...payload.data, manageToken: payload.manageToken };
    }
    localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber)); feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? '✓ Preferences saved in this browser’s local demo. No email was sent.' : '✓ 订阅设置已仅保存于本浏览器的本地演示中，未发送邮件。'; restoreSubscription();
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; } finally { button.disabled = false; }
}
async function unsubscribe() {
  if (!state.subscriber) return; const feedback = document.querySelector('#subscription-feedback');
  try {
    await api(`/api/subscribers/${state.subscriber.id}`, { method: 'DELETE', headers: { 'x-manage-token': state.subscriber.manageToken } });
    localStorage.removeItem('dataTraceSubscriber'); state.subscriber = null; document.querySelector('#email').disabled = false; document.querySelector('#manage-actions').hidden = true;
    feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? 'Subscription cancelled.' : '订阅已取消。';
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}

let searchTimer;
function bindEvents() {
  window.addEventListener('hashchange', route);
  document.querySelector('#language-toggle').addEventListener('click', async () => { state.language = state.language === 'en' ? 'zh' : 'en'; localStorage.setItem('dataTraceLanguage', state.language); applyTranslations(); await loadTaxonomy(); });
  document.querySelector('.menu-button').addEventListener('click', (event) => { const nav = document.querySelector('.topbar nav'); nav.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(nav.classList.contains('open'))); });
  document.querySelector('#reg-search').addEventListener('input', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.query = event.target.value.trim(); loadRegulations(); }, 220); });
  document.querySelectorAll('[data-jurisdiction]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-jurisdiction]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.jurisdiction = button.dataset.jurisdiction; loadRegulations(); }));
  for (const key of ['industry', 'topic', 'type']) document.querySelector(`#${key}-filter`).addEventListener('change', (event) => { state[key] = event.target.value; loadRegulations(); });
  document.querySelectorAll('[data-timeline-jurisdiction]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-timeline-jurisdiction]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.timelineJurisdiction = button.dataset.timelineJurisdiction; renderTimeline(); }));
  document.querySelectorAll('[data-jurisdiction-jump]').forEach((button) => button.addEventListener('click', () => { state.jurisdiction = button.dataset.jurisdictionJump; document.querySelectorAll('[data-jurisdiction]').forEach((item) => item.classList.toggle('active', item.dataset.jurisdiction === state.jurisdiction)); location.hash = '#library'; loadRegulations(); }));
  document.addEventListener('click', (event) => { const card = event.target.closest('[data-regulation-id]'); if (card) openRegulation(card.dataset.regulationId); const update = event.target.closest('[data-update-regulation]'); if (update?.dataset.updateRegulation) openRegulation(update.dataset.updateRegulation); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDetail(); if (event.key === 'Enter') { const card = event.target.closest('[data-regulation-id]'); if (card) openRegulation(card.dataset.regulationId); } });
  document.querySelector('#detail-close').addEventListener('click', closeDetail); document.querySelector('.overlay-backdrop').addEventListener('click', closeDetail);
  document.querySelector('#subscription-form').addEventListener('submit', submitSubscription); document.querySelector('#unsubscribe-button').addEventListener('click', unsubscribe);
}

async function init() {
  document.querySelector('#latest-updates').innerHTML = skeletons(4); document.querySelector('#regulation-grid').innerHTML = skeletons(6); document.querySelector('#timeline-list').innerHTML = skeletons(5);
  bindEvents(); applyTranslations(); route(); restoreSubscription();
  const results = await Promise.allSettled([loadHealth(), loadTaxonomy(), loadUpdates(), loadRegulations(), loadBriefingPreview()]);
  const failed = results.filter((item) => item.status === 'rejected'); if (failed.length) console.error('Initial data load failed', failed.map((item) => item.reason));
}
init();
