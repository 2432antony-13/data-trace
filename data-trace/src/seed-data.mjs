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
