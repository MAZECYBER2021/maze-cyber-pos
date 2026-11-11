/** MAZE CYBER POS - Google Apps Script backend
 * Bind this script to the Google Sheet that will hold the central database.
 * Run setupMazePos() once from the Apps Script editor before deployment.
 */
const TZ = 'Africa/Nairobi';
const HEADERS = {
  Users: ['userId','email','displayName','role','salt','passwordHash','active','createdAt','lastLogin'],
  Services: ['serviceId','category','name','priceText','governmentFee','cyberFee','active','requiresPrice','description','updatedAt'],
  Sales: ['transactionId','receiptNo','occurredAt','serverReceivedAt','deviceId','location','userId','userEmail','paymentMethod','paymentReference','customerName','notes','governmentTotal','cyberIncome','customerTotal','linesJson'],
  Expenses: ['expenseId','occurredAt','serverReceivedAt','deviceId','location','userId','userEmail','category','description','amount','paymentMethod','notes'],
  Devices: ['deviceId','location','firstSeen','lastSeen','lastSyncBy'],
  AuditLog: ['timestamp','userId','email','action','details','deviceId'],
  Sessions: ['tokenHash','userId','expiresAt','createdAt','deviceId'],
  ReportSnapshots: ['periodFrom','periodTo','transactions','customerCollections','governmentFees','cyberIncome','expenses','netOperatingBalance','cashReceived','mpesaReceived','savedAt','savedBy']
};
const CATALOGUE = [{"serviceId":"SVC001","category":"Printing, Photocopy & Scanning","name":"Photocopy Black and White","priceText":"5/-","governmentFee":0.0,"cyberFee":5.0,"active":true,"requiresPrice":false,"description":"Photocopy Black and White"},{"serviceId":"SVC002","category":"Printing, Photocopy & Scanning","name":"Photocopy Colored","priceText":"10/-","governmentFee":0.0,"cyberFee":10.0,"active":true,"requiresPrice":false,"description":"Photocopy Colored"},{"serviceId":"SVC003","category":"Printing, Photocopy & Scanning","name":"Scanning (per page)","priceText":"20/-","governmentFee":0.0,"cyberFee":20.0,"active":true,"requiresPrice":false,"description":"Scanning (per page)"},{"serviceId":"SVC004","category":"Printing, Photocopy & Scanning","name":"Printing Plain Paper (Black and White)","priceText":"10/- per page","governmentFee":0.0,"cyberFee":10.0,"active":true,"requiresPrice":false,"description":"Printing Plain Paper (Black and White)"},{"serviceId":"SVC005","category":"Printing, Photocopy & Scanning","name":"Printing Plain Paper (Colored)","priceText":"20/- per page","governmentFee":0.0,"cyberFee":20.0,"active":true,"requiresPrice":false,"description":"Printing Plain Paper (Colored)"},{"serviceId":"SVC006","category":"Printing, Photocopy & Scanning","name":"Printing Glossy Paper","priceText":"30/-","governmentFee":0.0,"cyberFee":30.0,"active":true,"requiresPrice":false,"description":"Printing Glossy Paper"},{"serviceId":"SVC007","category":"Printing, Photocopy & Scanning","name":"Printing Ivory Paper","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Printing Ivory Paper"},{"serviceId":"SVC008","category":"Printing, Photocopy & Scanning","name":"Printing Embossed Paper","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Printing Embossed Paper"},{"serviceId":"SVC009","category":"Printing, Photocopy & Scanning","name":"Photo Paper Printing","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Photo Paper Printing"},{"serviceId":"SVC010","category":"Printing, Photocopy & Scanning","name":"Photo Paper Printing (4x6)","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Photo Paper Printing (4x6)"},{"serviceId":"SVC011","category":"Printing, Photocopy & Scanning","name":"Passport Photo Printing (2 pcs)","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Passport Photo Printing (2 pcs)"},{"serviceId":"SVC012","category":"Printing, Photocopy & Scanning","name":"Passport Photo Printing (4 pcs)","priceText":"200/-","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Passport Photo Printing (4 pcs)"},{"serviceId":"SVC013","category":"Printing, Photocopy & Scanning","name":"Passport Photo Printing (8 pcs)","priceText":"300/-","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Passport Photo Printing (8 pcs)"},{"serviceId":"SVC014","category":"Printing, Photocopy & Scanning","name":"Sticker Paper Printing","priceText":"70/-","governmentFee":0.0,"cyberFee":70.0,"active":true,"requiresPrice":false,"description":"Sticker Paper Printing"},{"serviceId":"SVC015","category":"Printing, Photocopy & Scanning","name":"Till / Pochi / Bank Printing (Flyers Glossy)","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Till / Pochi / Bank Printing (Flyers Glossy)"},{"serviceId":"SVC016","category":"Printing, Photocopy & Scanning","name":"Till / Pochi / Bank Printing (Plain Paper)","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Till / Pochi / Bank Printing (Plain Paper)"},{"serviceId":"SVC017","category":"Binding, Lamination & Document Services","name":"Binding (Tape) 0-20 pgs","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Binding (Tape) 0-20 pgs"},{"serviceId":"SVC018","category":"Binding, Lamination & Document Services","name":"Binding (Tape) 20-50 pgs","priceText":"70/-","governmentFee":0.0,"cyberFee":70.0,"active":true,"requiresPrice":false,"description":"Binding (Tape) 20-50 pgs"},{"serviceId":"SVC019","category":"Binding, Lamination & Document Services","name":"Binding (Tape) 50-70 pgs","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Binding (Tape) 50-70 pgs"},{"serviceId":"SVC020","category":"Binding, Lamination & Document Services","name":"Binding (Tape) 70-100 pgs","priceText":"120/-","governmentFee":0.0,"cyberFee":120.0,"active":true,"requiresPrice":false,"description":"Binding (Tape) 70-100 pgs"},{"serviceId":"SVC021","category":"Binding, Lamination & Document Services","name":"Binding (Tape) 100-200 pgs","priceText":"200/-","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Binding (Tape) 100-200 pgs"},{"serviceId":"SVC022","category":"Binding, Lamination & Document Services","name":"Spiral Binding 0-20 pgs","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Spiral Binding 0-20 pgs"},{"serviceId":"SVC023","category":"Binding, Lamination & Document Services","name":"Spiral Binding 20-50 pgs","priceText":"150/-","governmentFee":0.0,"cyberFee":150.0,"active":true,"requiresPrice":false,"description":"Spiral Binding 20-50 pgs"},{"serviceId":"SVC024","category":"Binding, Lamination & Document Services","name":"Spiral Binding 50-200 pgs","priceText":"250/-","governmentFee":0.0,"cyberFee":250.0,"active":true,"requiresPrice":false,"description":"Spiral Binding 50-200 pgs"},{"serviceId":"SVC025","category":"Binding, Lamination & Document Services","name":"Spiral Binding 200-500 pgs","priceText":"400/-","governmentFee":0.0,"cyberFee":400.0,"active":true,"requiresPrice":false,"description":"Spiral Binding 200-500 pgs"},{"serviceId":"SVC026","category":"Binding, Lamination & Document Services","name":"Lamination (A3)","priceText":"150/-","governmentFee":0.0,"cyberFee":150.0,"active":true,"requiresPrice":false,"description":"Lamination (A3)"},{"serviceId":"SVC027","category":"Binding, Lamination & Document Services","name":"Lamination (A4)","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Lamination (A4)"},{"serviceId":"SVC028","category":"Binding, Lamination & Document Services","name":"Lamination (A5)","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Lamination (A5)"},{"serviceId":"SVC029","category":"Binding, Lamination & Document Services","name":"Lamination (IDs)","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Lamination (IDs)"},{"serviceId":"SVC030","category":"Binding, Lamination & Document Services","name":"Duplicate ID","priceText":"100/-","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Duplicate ID"},{"serviceId":"SVC031","category":"Binding, Lamination & Document Services","name":"Typesetting","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Typesetting"},{"serviceId":"SVC032","category":"Binding, Lamination & Document Services","name":"Database","priceText":"150/-","governmentFee":0.0,"cyberFee":150.0,"active":true,"requiresPrice":false,"description":"Database"},{"serviceId":"SVC033","category":"Binding, Lamination & Document Services","name":"Browsing / Internet Usage","priceText":"1 bob per min","governmentFee":0.0,"cyberFee":1.0,"active":true,"requiresPrice":false,"description":"Browsing / Internet Usage"},{"serviceId":"SVC034","category":"Design & Printing","name":"Design Poster / Flyer / Business Card","priceText":"300/-","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Design Poster / Flyer / Business Card"},{"serviceId":"SVC035","category":"Design & Printing","name":"Design Banner","priceText":"1,500/-","governmentFee":0.0,"cyberFee":1500.0,"active":true,"requiresPrice":false,"description":"Design Banner"},{"serviceId":"SVC036","category":"Design & Printing","name":"Banner Printing (1m x 1m)","priceText":"800/-","governmentFee":0.0,"cyberFee":800.0,"active":true,"requiresPrice":false,"description":"Banner Printing (1m x 1m)"},{"serviceId":"SVC037","category":"Design & Printing","name":"Banner Printing (Below 4 meters)","priceText":"800/- per m²","governmentFee":0.0,"cyberFee":800.0,"active":true,"requiresPrice":false,"description":"Banner Printing (Below 4 meters)"},{"serviceId":"SVC038","category":"Design & Printing","name":"Banner Printing (Above 4 meters)","priceText":"650/- per m²","governmentFee":0.0,"cyberFee":650.0,"active":true,"requiresPrice":false,"description":"Banner Printing (Above 4 meters)"},{"serviceId":"SVC039","category":"Software Installation & Setup","name":"Windows 7 Installation","priceText":"700/-","governmentFee":0.0,"cyberFee":700.0,"active":true,"requiresPrice":false,"description":"Windows 7 Installation"},{"serviceId":"SVC040","category":"Software Installation & Setup","name":"Windows 8 Installation","priceText":"2,000/-","governmentFee":0.0,"cyberFee":2000.0,"active":true,"requiresPrice":false,"description":"Windows 8 Installation"},{"serviceId":"SVC041","category":"Software Installation & Setup","name":"Windows 10 Installation","priceText":"1,000/-","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":false,"description":"Windows 10 Installation"},{"serviceId":"SVC042","category":"Software Installation & Setup","name":"Windows 11 Installation","priceText":"1,500/-","governmentFee":0.0,"cyberFee":1500.0,"active":true,"requiresPrice":false,"description":"Windows 11 Installation"},{"serviceId":"SVC043","category":"Software Installation & Setup","name":"MS Office 2013 Installation","priceText":"500/-","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"MS Office 2013 Installation"},{"serviceId":"SVC044","category":"Software Installation & Setup","name":"MS Office 2021 Installation","priceText":"1,000/-","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":false,"description":"MS Office 2021 Installation"},{"serviceId":"SVC045","category":"Social Media & Digital Services","name":"WhatsApp Phone Setup","priceText":"50/-","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"WhatsApp Phone Setup"},{"serviceId":"SVC046","category":"Social Media & Digital Services","name":"Facebook Page Opening","priceText":"50 (Has Account) / 200 (Opening)","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Facebook Page Opening"},{"serviceId":"SVC047","category":"Social Media & Digital Services","name":"Instagram Opening","priceText":"50 (Has Account) / 200 (Opening)","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Instagram Opening"},{"serviceId":"SVC048","category":"Social Media & Digital Services","name":"TikTok Opening","priceText":"50 (Has Account) / 200 (Opening)","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"TikTok Opening"},{"serviceId":"SVC049","category":"Social Media & Digital Services","name":"Music Transfer (Phone/Flash to Phone/Flash)","priceText":"50 (Cyber fee)","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Music Transfer (Phone/Flash to Phone/Flash)"},{"serviceId":"SVC050","category":"Social Media & Digital Services","name":"Music (Mp3 Single)","priceText":"5 / 10","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Music (Mp3 Single)"},{"serviceId":"SVC051","category":"Social Media & Digital Services","name":"Music (Mix)","priceText":"20 / 30","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Music (Mix)"},{"serviceId":"SVC052","category":"Social Media & Digital Services","name":"Movies / Series (Cocomelon)","priceText":"50 / 30","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Movies / Series (Cocomelon)"},{"serviceId":"SVC053","category":"Social Media & Digital Services","name":"Games Video (Less than 5GB)","priceText":"500/-","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Games Video (Less than 5GB)"},{"serviceId":"SVC054","category":"Social Media & Digital Services","name":"Games Video (More than 5GB)","priceText":"1K","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":false,"description":"Games Video (More than 5GB)"},{"serviceId":"SVC055","category":"CBO Charges (Kasarani)","name":"Application Fee","priceText":"3K","governmentFee":0.0,"cyberFee":3000.0,"active":true,"requiresPrice":false,"description":"Application Fee"},{"serviceId":"SVC056","category":"CBO Charges (Kasarani)","name":"Email","priceText":"200","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Email"},{"serviceId":"SVC057","category":"CBO Charges (Kasarani)","name":"Minutes","priceText":"200","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Minutes"},{"serviceId":"SVC058","category":"CBO Charges (Kasarani)","name":"Constitution","priceText":"300","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Constitution"},{"serviceId":"SVC059","category":"Archi Portal / Land Services","name":"Land Search","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Land Search"},{"serviceId":"SVC060","category":"Archi Portal / Land Services","name":"Register Land","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Register Land"},{"serviceId":"SVC061","category":"E-Procurement (EGPKenya)","name":"Supplier Registration","priceText":"1K (Cyber fee)","governmentFee":0.0,"cyberFee":1.0,"active":true,"requiresPrice":false,"description":"Supplier Registration"},{"serviceId":"SVC062","category":"General Cyber Services & Applications","name":"NSSF Application","priceText":"300/-","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"NSSF Application"},{"serviceId":"SVC063","category":"General Cyber Services & Applications","name":"Email Creation","priceText":"100","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"Email Creation"},{"serviceId":"SVC064","category":"General Cyber Services & Applications","name":"Converting Documents (Format to Format)","priceText":"50 (Cyber fee)","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Converting Documents (Format to Format)"},{"serviceId":"SVC065","category":"General Cyber Services & Applications","name":"Combining Documents","priceText":"50 (Cyber fee)","governmentFee":0.0,"cyberFee":50.0,"active":true,"requiresPrice":false,"description":"Combining Documents"},{"serviceId":"SVC066","category":"General Cyber Services & Applications","name":"Water Application","priceText":"500 / 1K","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Water Application"},{"serviceId":"SVC067","category":"General Cyber Services & Applications","name":"Job Application","priceText":"300 (Depends on tabs to be filled)","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Job Application"},{"serviceId":"SVC068","category":"General Cyber Services & Applications","name":"Job Application with Uploads","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Job Application with Uploads"},{"serviceId":"SVC069","category":"General Cyber Services & Applications","name":"Job Application (More than 5 stages)","priceText":"1,500","governmentFee":0.0,"cyberFee":1500.0,"active":true,"requiresPrice":false,"description":"Job Application (More than 5 stages)"},{"serviceId":"SVC070","category":"Computer Packages (Training)","name":"Duration Options","priceText":"2 Hours / 4 Hours — 2 Months / 1 Month","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Duration Options"},{"serviceId":"SVC071","category":"Computer Packages (Training)","name":"Computer Packages Total","priceText":"6,000","governmentFee":0.0,"cyberFee":6000.0,"active":true,"requiresPrice":false,"description":"Computer Packages Total"},{"serviceId":"SVC072","category":"Computer Packages (Training)","name":"Installment Payment (2 Months)","priceText":"Bal 1K / 3K","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Installment Payment (2 Months)"},{"serviceId":"SVC073","category":"Computer Packages (Training)","name":"On Admission Balance (Next Month)","priceText":"1 Month – 3K / Admission Balance – 2K","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"On Admission Balance (Next Month)"},{"serviceId":"SVC074","category":"KRA (Kenya Revenue Authority)","name":"Pin Registration","priceText":"200","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Pin Registration"},{"serviceId":"SVC075","category":"KRA (Kenya Revenue Authority)","name":"Retrieval","priceText":"300","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Retrieval"},{"serviceId":"SVC076","category":"KRA (Kenya Revenue Authority)","name":"Rental","priceText":"200","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Rental"},{"serviceId":"SVC077","category":"KRA (Kenya Revenue Authority)","name":"P.A.","priceText":"300","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"P.A."},{"serviceId":"SVC078","category":"KRA (Kenya Revenue Authority)","name":"VAT","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"VAT"},{"serviceId":"SVC079","category":"KRA (Kenya Revenue Authority)","name":"Company Nil","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Company Nil"},{"serviceId":"SVC080","category":"KRA (Kenya Revenue Authority)","name":"Withholding","priceText":"1,000","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":false,"description":"Withholding"},{"serviceId":"SVC081","category":"KRA (Kenya Revenue Authority)","name":"Declaring","priceText":"1,500","governmentFee":0.0,"cyberFee":1500.0,"active":true,"requiresPrice":false,"description":"Declaring"},{"serviceId":"SVC082","category":"KRA (Kenya Revenue Authority)","name":"KRA Retrieval Pin","priceText":"300 (Log in with ID number in iTax / Change email via agent)","governmentFee":0.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"KRA Retrieval Pin"},{"serviceId":"SVC083","category":"KEBS & Lands / Ardhiasa","name":"KEBS","priceText":"1,500 (Cyber fee)","governmentFee":0.0,"cyberFee":1500.0,"active":true,"requiresPrice":false,"description":"KEBS"},{"serviceId":"SVC084","category":"KEBS & Lands / Ardhiasa","name":"Ardhiasa Account Registration","priceText":"500","governmentFee":0.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Ardhiasa Account Registration"},{"serviceId":"SVC085","category":"KEBS & Lands / Ardhiasa","name":"Ardhiasa Apply","priceText":"1,000","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":false,"description":"Ardhiasa Apply"},{"serviceId":"SVC086","category":"BRS & Marriage","name":"Business Registration","priceText":"950 (Govt fee) / 500 (Cyber fee)","governmentFee":950.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Business Registration"},{"serviceId":"SVC087","category":"BRS & Marriage","name":"Company Registration","priceText":"15,000","governmentFee":0.0,"cyberFee":15000.0,"active":true,"requiresPrice":false,"description":"Company Registration"},{"serviceId":"SVC088","category":"BRS & Marriage","name":"Marriage","priceText":"650 (1st Govt fee) / 850 (After AG appt Govt fee) / 1,000 (Cyber fee)","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":true,"description":"Marriage"},{"serviceId":"SVC089","category":"E-Citizen Services","name":"Birth / Death Certification","priceText":"250 (Govt fee) / 200 (Cyber fee)","governmentFee":250.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Birth / Death Certification"},{"serviceId":"SVC090","category":"E-Citizen Services","name":"Good Conduct","priceText":"1,050 (Govt fee) / 200 (Cyber fee)","governmentFee":1050.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Good Conduct"},{"serviceId":"SVC091","category":"E-Citizen Services","name":"Passport International (34 Pages)","priceText":"7,550 (Govt fee) / 500 (Cyber fee)","governmentFee":7550.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Passport International (34 Pages)"},{"serviceId":"SVC092","category":"E-Citizen Services","name":"Passport International (54 Pages)","priceText":"9,550 (Govt fee) / 500 (Cyber fee)","governmentFee":9550.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Passport International (54 Pages)"},{"serviceId":"SVC093","category":"E-Citizen Services","name":"Temporary Passport","priceText":"1,050 (Govt fee) / 300 (Cyber fee)","governmentFee":1050.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Temporary Passport"},{"serviceId":"SVC094","category":"Ministry of Foreign Affairs & NTSA","name":"Attestation (Ministry of Foreign Affairs)","priceText":"250 (Govt fee) / 200 (Cyber fee)","governmentFee":250.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Attestation (Ministry of Foreign Affairs)"},{"serviceId":"SVC095","category":"Ministry of Foreign Affairs & NTSA","name":"NTSA Registration","priceText":"100","governmentFee":0.0,"cyberFee":100.0,"active":true,"requiresPrice":false,"description":"NTSA Registration"},{"serviceId":"SVC096","category":"Ministry of Foreign Affairs & NTSA","name":"NTSA Renewal (1 Year)","priceText":"650 (Govt fee) / 250 (Cyber fee)","governmentFee":650.0,"cyberFee":250.0,"active":true,"requiresPrice":false,"description":"NTSA Renewal (1 Year)"},{"serviceId":"SVC097","category":"Ministry of Foreign Affairs & NTSA","name":"Renewal of DL (3 Years)","priceText":"3,050 (Govt fee) / 300 (Cyber fee)","governmentFee":3050.0,"cyberFee":300.0,"active":true,"requiresPrice":false,"description":"Renewal of DL (3 Years)"},{"serviceId":"SVC098","category":"Ministry of Foreign Affairs & NTSA","name":"Car Transfer","priceText":"500 / 1,000","governmentFee":0.0,"cyberFee":null,"active":true,"requiresPrice":true,"description":"Car Transfer"},{"serviceId":"SVC099","category":"Ministry of Foreign Affairs & NTSA","name":"Inspection","priceText":"1,050 (Govt fee) / 200 (Cyber fee)","governmentFee":1050.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Inspection"},{"serviceId":"SVC100","category":"Ministry of Foreign Affairs & NTSA","name":"PDL / Interim","priceText":"200 (Cyber fee)","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"PDL / Interim"},{"serviceId":"SVC101","category":"Ministry of Foreign Affairs & NTSA","name":"Badge","priceText":"200 (Cyber fee)","governmentFee":0.0,"cyberFee":200.0,"active":true,"requiresPrice":false,"description":"Badge"},{"serviceId":"SVC102","category":"Ministry of Foreign Affairs & NTSA","name":"Logbook Duplicate / Change","priceText":"700 / 1,000 (Cyber fee)","governmentFee":0.0,"cyberFee":1000.0,"active":true,"requiresPrice":true,"description":"Logbook Duplicate / Change"},{"serviceId":"SVC103","category":"Ministry of Foreign Affairs & NTSA","name":"Reflective Number Plate (New Generation)","priceText":"3,050 (Govt fee) / 500 (Cyber fee)","governmentFee":3050.0,"cyberFee":500.0,"active":true,"requiresPrice":false,"description":"Reflective Number Plate (New Generation)"}];

function setupMazePos() {
  const p = PropertiesService.getScriptProperties();
  const ssId = p.getProperty('MAZE_SPREADSHEET_ID') || SpreadsheetApp.getActiveSpreadsheet().getId();
  p.setProperty('MAZE_SPREADSHEET_ID', ssId);
  const ss = SpreadsheetApp.openById(ssId);
  Object.keys(HEADERS).forEach(name => {
    let sh = ss.getSheetByName('POS_' + name);
    if (!sh) sh = ss.insertSheet('POS_' + name);
    if (sh.getLastRow() === 0) sh.getRange(1,1,1,HEADERS[name].length).setValues([HEADERS[name]]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,HEADERS[name].length).setFontWeight('bold').setBackground('#171717').setFontColor('#D4AF37');
  });
  const svc = ss.getSheetByName('POS_Services');
  if (svc.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const rows = CATALOGUE.map(x => [x.serviceId,x.category,x.name,x.priceText,x.governmentFee === null ? '' : x.governmentFee,x.cyberFee === null ? '' : x.cyberFee,x.active,x.requiresPrice,x.description,now]);
    if (rows.length) svc.getRange(2,1,rows.length,HEADERS.Services.length).setValues(rows);
  }
  const users = ss.getSheetByName('POS_Users');
  if (users.getLastRow() <= 1) {
    const email = (p.getProperty('MAZE_ADMIN_EMAIL') || '').trim().toLowerCase();
    const password = p.getProperty('MAZE_ADMIN_PASSWORD') || '';
    if (!email || password.length < 12) throw new Error('Set Script Properties MAZE_ADMIN_EMAIL and MAZE_ADMIN_PASSWORD (at least 12 characters) before setup.');
    const salt = randomToken();
    users.appendRow([Utilities.getUuid(),email,'MAZE CYBER Administrator','ADMIN',salt,passwordHash_(password,salt),true,new Date().toISOString(),'']);
    p.deleteProperty('MAZE_ADMIN_PASSWORD');
  }
  SpreadsheetApp.flush();
  Logger.log('MAZE CYBER POS database ready: ' + ss.getUrl());
  return ss.getUrl();
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ok:true,app:'MAZE CYBER POS API',time:new Date().toISOString()})).setMimeType(ContentService.MimeType.JSON);
}

// The static PWA sends a simple form POST into a hidden iframe. This avoids CORS preflight
// problems with Apps Script redirects. The iframe posts the JSON result back to the app.
function doPost(e) {
  let nonce = '';
  try {
    const raw = e && e.parameter && e.parameter.payload ? e.parameter.payload : '{}';
    const req = JSON.parse(raw);
    nonce = String(req.nonce || '');
    const allowed = (PropertiesService.getScriptProperties().getProperty('MAZE_ALLOWED_ORIGINS') || '').split(',').map(s=>s.trim()).filter(Boolean);
    const origin = String(req.origin || '');
    if (!allowed.includes(origin)) throw new Error('This app origin is not approved. Ask the administrator to add it to MAZE_ALLOWED_ORIGINS.');
    const result = route_(req);
    return bridge_(nonce, {ok:true,data:result});
  } catch (err) {
    return bridge_(nonce, {ok:false,error:String(err && err.message || err)});
  }
}

function bridge_(nonce, result) {
  const payload = JSON.stringify({nonce:nonce,result:result}).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>parent.postMessage('+payload+', "*");</script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function route_(r) {
  const action = String(r.action || '');
  if (action === 'login') return login_(r);
  if (action === 'health') return {time:new Date().toISOString()};
  const session = requireSession_(r.token);
  if (action === 'bootstrap') return bootstrap_(session);
  if (action === 'sync') return sync_(session,r);
  if (action === 'report') return report_(session,r.dateFrom,r.dateTo);
  if (action === 'saveReportSnapshot') return saveReportSnapshot_(session,r.dateFrom,r.dateTo);
  if (action === 'createUser') return createUser_(session,r.user || {});
  if (action === 'updateService') return updateService_(session,r.service || {});
  if (action === 'backup') return backup_(session);
  if (action === 'listUsers') return listUsers_(session);
  if (action === 'setUserActive') return setUserActive_(session,r.userId,!!r.active);
  throw new Error('Unknown action: ' + action);
}

function login_(r) {
  const email = String(r.email || '').trim().toLowerCase();
  const password = String(r.password || '');
  if (!email || !password) throw new Error('Enter your email and password.');
  const cache = CacheService.getScriptCache();
  const failKey = 'loginfail:' + email;
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= 8) throw new Error('Too many login attempts. Wait 15 minutes and try again.');
  const sh = sheet_('Users');
  const values = sh.getDataRange().getValues();
  let found = null, rowNo = 0;
  for (let i=1;i<values.length;i++) if (String(values[i][1]).toLowerCase() === email) { found=values[i]; rowNo=i+1; break; }
  if (!found || String(found[6]) !== 'true' && found[6] !== true || passwordHash_(password,String(found[4])) !== String(found[5])) {
    cache.put(failKey,String(fails+1),900); throw new Error('Email or password is incorrect, or the account is inactive.');
  }
  cache.remove(failKey);
  const token = randomToken()+randomToken();
  const expires = new Date(Date.now()+12*60*60*1000);
  const deviceId = String(r.deviceId || 'unknown');
  sheet_('Sessions').appendRow([digest_(token),found[0],expires.toISOString(),new Date().toISOString(),deviceId]);
  sh.getRange(rowNo,9).setValue(new Date().toISOString());
  audit_(found[0],email,'LOGIN','Successful login',deviceId);
  return {token,expiresAt:expires.toISOString(),user:{userId:found[0],email:found[1],displayName:found[2],role:found[3]},services:readServices_(),serverTime:new Date().toISOString()};
}

function requireSession_(token) {
  if (!token) throw new Error('Please sign in again.');
  const hash = digest_(String(token));
  const cache = CacheService.getScriptCache();
  const cached = cache.get('sess:'+hash);
  if (cached) {
    const s=JSON.parse(cached);
    if (new Date(s.expiresAt).getTime()>Date.now()) { const u=findUserById_(s.userId); if(!u || !u.active) throw new Error('User account is inactive.'); return s; }
  }
  const sh=sheet_('Sessions'), vals=sh.getDataRange().getValues();
  for(let i=1;i<vals.length;i++) if(String(vals[i][0])===hash) {
    const exp=new Date(vals[i][2]);
    if(exp.getTime()<=Date.now()) throw new Error('Session expired. Sign in again.');
    const u=findUserById_(String(vals[i][1]));
    if(!u || !u.active) throw new Error('User account is inactive.');
    const s={userId:u.userId,email:u.email,displayName:u.displayName,role:u.role,expiresAt:exp.toISOString(),deviceId:String(vals[i][4])};
    cache.put('sess:'+hash,JSON.stringify(s),Math.min(21600,Math.max(60,Math.floor((exp.getTime()-Date.now())/1000))));
    return s;
  }
  throw new Error('Session not found. Sign in again.');
}

function bootstrap_(s) { return {user:{userId:s.userId,email:s.email,displayName:s.displayName,role:s.role},services:readServices_(),serverTime:new Date().toISOString()}; }

function sync_(s,r) {
  requireRole_(s,['ADMIN','MANAGER','CASHIER']);
  const lock=LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const deviceId=String(r.deviceId||s.deviceId||'unknown');
    const location=String(r.location||'Unassigned').slice(0,100);
    let salesAdded=0, expensesAdded=0, duplicates=0, errors=[];
    const sales=Array.isArray(r.sales)?r.sales:[];
    sales.forEach(item=>{
      try {
        const id=String(item.transactionId||''); if(!id) throw new Error('Missing transaction ID');
        if(exists_('Sales',1,id)){duplicates++;return;}
        const lines=Array.isArray(item.lines)?item.lines:[]; if(!lines.length) throw new Error('Sale has no line items');
        let gov=0,cyber=0;
        const clean=lines.map(l=>{
          const qty=Number(l.quantity),g=Number(l.governmentFee||0),c=Number(l.cyberFee||0);
          if(!l.name || !(qty>0) || g<0 || c<0 || !Number.isFinite(qty+g+c)) throw new Error('Invalid sale line');
          gov+=qty*g; cyber+=qty*c;
          return {serviceId:String(l.serviceId||''),name:String(l.name),category:String(l.category||''),quantity:qty,governmentFee:g,cyberFee:c};
        });
        const method=String(item.paymentMethod||''); if(!['Cash','M-PESA'].includes(method)) throw new Error('Payment method must be Cash or M-PESA');
        const occurred=validIso_(item.occurredAt);
        const receipt=String(item.receiptNo||('MC-'+Utilities.getUuid().slice(0,8).toUpperCase()));
        const received=new Date().toISOString();
        sheet_('Sales').appendRow([id,receipt,occurred,received,deviceId,location,s.userId,s.email,method,String(item.paymentReference||''),String(item.customerName||''),String(item.notes||''),round2_(gov),round2_(cyber),round2_(gov+cyber),JSON.stringify(clean)]);
        salesAdded++;
      } catch(err){errors.push({id:String(item.transactionId||''),message:String(err.message||err)});}
    });
    const expenses=Array.isArray(r.expenses)?r.expenses:[];
    expenses.forEach(item=>{
      try {
        const id=String(item.expenseId||''); if(!id) throw new Error('Missing expense ID');
        if(exists_('Expenses',1,id)){duplicates++;return;}
        const amount=Number(item.amount); if(!(amount>0)||!Number.isFinite(amount)) throw new Error('Expense amount must be greater than zero');
        const method=String(item.paymentMethod||'Cash'); if(!['Cash','M-PESA'].includes(method)) throw new Error('Payment method must be Cash or M-PESA');
        sheet_('Expenses').appendRow([id,validIso_(item.occurredAt),new Date().toISOString(),deviceId,location,s.userId,s.email,String(item.category||'General'),String(item.description||''),round2_(amount),method,String(item.notes||'')]);
        expensesAdded++;
      } catch(err){errors.push({id:String(item.expenseId||''),message:String(err.message||err)});}
    });
    upsertDevice_(deviceId,location,s.email);
    audit_(s.userId,s.email,'SYNC',JSON.stringify({salesAdded,expensesAdded,duplicates,errors:errors.length}),deviceId);
    SpreadsheetApp.flush();
    return {salesAdded,expensesAdded,duplicates,errors,serverTime:new Date().toISOString()};
  } finally { lock.releaseLock(); }
}

function report_(s,dateFrom,dateTo) {
  const from=String(dateFrom||Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd'));
  const to=String(dateTo||from);
  const sales=readRows_('Sales'), expenses=readRows_('Expenses');
  const days={}; const ensure=d=>days[d]||(days[d]={date:d,transactions:0,customerCollections:0,governmentFees:0,cyberIncome:0,expenses:0,cash:0,mpesa:0,net:0});
  sales.forEach(x=>{const d=dayKey_(x[2]); if(d<from||d>to)return; const z=ensure(d); z.transactions++; z.governmentFees+=Number(x[12]||0); z.cyberIncome+=Number(x[13]||0); z.customerCollections+=Number(x[14]||0); if(x[8]==='Cash')z.cash+=Number(x[14]||0); if(x[8]==='M-PESA')z.mpesa+=Number(x[14]||0);});
  expenses.forEach(x=>{const d=dayKey_(x[1]); if(d<from||d>to)return; ensure(d).expenses+=Number(x[9]||0);});
  Object.keys(days).forEach(k=>days[k].net=round2_(days[k].cyberIncome-days[k].expenses));
  const list=Object.values(days).sort((a,b)=>a.date.localeCompare(b.date));
  const totals=list.reduce((a,d)=>{['transactions','customerCollections','governmentFees','cyberIncome','expenses','cash','mpesa','net'].forEach(k=>a[k]+=d[k]);return a;},{transactions:0,customerCollections:0,governmentFees:0,cyberIncome:0,expenses:0,cash:0,mpesa:0,net:0});
  return {from,to,days:list,totals,serverTime:new Date().toISOString()};
}


function saveReportSnapshot_(s,dateFrom,dateTo){
  requireRole_(s,['ADMIN','MANAGER']);
  const r=report_(s,dateFrom,dateTo),t=r.totals,sh=sheet_('ReportSnapshots'),v=sh.getDataRange().getValues();
  const row=[r.from,r.to,t.transactions,t.customerCollections,t.governmentFees,t.cyberIncome,t.expenses,t.net,t.cash,t.mpesa,new Date().toISOString(),s.email];
  let found=0;for(let i=1;i<v.length;i++)if(String(v[i][0])===r.from&&String(v[i][1])===r.to){found=i+1;break;}
  if(found)sh.getRange(found,1,1,row.length).setValues([row]);else sh.appendRow(row);
  audit_(s.userId,s.email,'SAVE_REPORT_SNAPSHOT',r.from+' to '+r.to,s.deviceId);
  return {saved:true,from:r.from,to:r.to,totals:t};
}

function createUser_(s,u) {
  requireRole_(s,['ADMIN']);
  const email=String(u.email||'').trim().toLowerCase(), name=String(u.displayName||'').trim(), role=String(u.role||'CASHIER'), password=String(u.password||'');
  if(!/^\S+@\S+\.\S+$/.test(email)||!name) throw new Error('Enter a valid email and display name.');
  if(!['ADMIN','MANAGER','CASHIER','VIEWER'].includes(role)) throw new Error('Invalid role.');
  if(password.length<12) throw new Error('Password must contain at least 12 characters.');
  if(findUserByEmail_(email)) throw new Error('That email already has a POS account.');
  const salt=randomToken(); sheet_('Users').appendRow([Utilities.getUuid(),email,name,role,salt,passwordHash_(password,salt),true,new Date().toISOString(),'']);
  audit_(s.userId,s.email,'CREATE_USER',email+' ('+role+')',s.deviceId);
  return {created:true,email,role};
}
function listUsers_(s){requireRole_(s,['ADMIN','MANAGER']);return readRows_('Users').map(x=>({userId:x[0],email:x[1],displayName:x[2],role:x[3],active:x[6]===true||String(x[6])==='true'}));}
function setUserActive_(s,id,active){requireRole_(s,['ADMIN']);const sh=sheet_('Users'),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(id)){sh.getRange(i+1,7).setValue(active);const ss=sheet_('Sessions'),sv=ss.getDataRange().getValues(),cache=CacheService.getScriptCache();for(let j=1;j<sv.length;j++)if(String(sv[j][1])===String(id))cache.remove('sess:'+String(sv[j][0]));audit_(s.userId,s.email,'SET_USER_ACTIVE',String(id)+'='+active,s.deviceId);return {updated:true};}throw new Error('User not found.');}
function updateService_(s,x){requireRole_(s,['ADMIN']);const sh=sheet_('Services'),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(x.serviceId)){sh.getRange(i+1,5).setValue(Number(x.governmentFee||0));sh.getRange(i+1,6).setValue(x.cyberFee===''||x.cyberFee===null?'':Number(x.cyberFee));sh.getRange(i+1,7).setValue(!!x.active);sh.getRange(i+1,8).setValue(!!x.requiresPrice);sh.getRange(i+1,10).setValue(new Date().toISOString());audit_(s.userId,s.email,'UPDATE_SERVICE',String(x.serviceId),s.deviceId);return {updated:true};}throw new Error('Service not found.');}
function backup_(s){requireRole_(s,['ADMIN']);const id=PropertiesService.getScriptProperties().getProperty('MAZE_SPREADSHEET_ID');const file=DriveApp.getFileById(id);const copy=file.makeCopy('MAZE CYBER POS BACKUP '+Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HHmm'));audit_(s.userId,s.email,'BACKUP',copy.getId(),s.deviceId);return {backupId:copy.getId(),url:copy.getUrl(),createdAt:new Date().toISOString()};}

function readServices_(){return readRows_('Services').map(x=>({serviceId:x[0],category:x[1],name:x[2],priceText:x[3],governmentFee:x[4]===''?0:Number(x[4]||0),cyberFee:x[5]===''?null:Number(x[5]),active:x[6]===true||String(x[6])==='true',requiresPrice:x[7]===true||String(x[7])==='true',description:x[8]}));}
function sheet_(name){const id=PropertiesService.getScriptProperties().getProperty('MAZE_SPREADSHEET_ID');if(!id)throw new Error('MAZE_SPREADSHEET_ID is not configured.');const sh=SpreadsheetApp.openById(id).getSheetByName('POS_'+name);if(!sh)throw new Error('Missing POS_'+name+' sheet. Run setupMazePos().');return sh;}
function readRows_(name){const v=sheet_(name).getDataRange().getValues();return v.slice(1);}
function exists_(name,col,id){const sh=sheet_(name),last=sh.getLastRow();if(last<2)return false;return !!sh.getRange(2,col,last-1,1).createTextFinder(String(id)).matchEntireCell(true).findNext();}
function findUserById_(id){const v=readRows_('Users');for(const x of v)if(String(x[0])===id)return {userId:x[0],email:x[1],displayName:x[2],role:x[3],active:x[6]===true||String(x[6])==='true'};return null;}
function findUserByEmail_(email){const v=readRows_('Users');for(const x of v)if(String(x[1]).toLowerCase()===email)return x;return null;}
function requireRole_(s,roles){if(!roles.includes(s.role))throw new Error('Your account does not have permission for this action.');}
function upsertDevice_(id,location,email){const sh=sheet_('Devices'),v=sh.getDataRange().getValues(),now=new Date().toISOString();for(let i=1;i<v.length;i++)if(String(v[i][0])===id){sh.getRange(i+1,2).setValue(location);sh.getRange(i+1,4).setValue(now);sh.getRange(i+1,5).setValue(email);return;}sh.appendRow([id,location,now,now,email]);}
function audit_(id,email,action,details,device){sheet_('AuditLog').appendRow([new Date().toISOString(),id,email,action,String(details).slice(0,1000),device||'']);}
function validIso_(v){const d=new Date(v);if(!v||isNaN(d.getTime()))throw new Error('Invalid transaction date/time.');return d.toISOString();}
function dayKey_(v){const d=new Date(v);return Utilities.formatDate(d,TZ,'yyyy-MM-dd');}
function round2_(n){return Math.round((Number(n)+Number.EPSILON)*100)/100;}
function randomToken(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function digest_(s){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8));}
function passwordHash_(password,salt){let h=digest_(salt+':'+password);for(let i=0;i<1800;i++)h=digest_(h+salt);return h;}
