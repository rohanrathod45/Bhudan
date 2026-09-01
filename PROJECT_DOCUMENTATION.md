# 🌏 भू-दान (BhuDan) — Hazard Risk & Relocation Decision Support System
## सर्वसमावेशक प्रकल्प माहिती व तांत्रिक दस्तऐवजीकरण (Comprehensive Project Documentation)

---

## 📌 १. प्रकल्पाचा परिचय (Project Overview)

**BhuDan (भू-दान)** हा **Smart India Hackathon (SIH 2026)** साठी विकसित केलेला एक **AI-संचालित निर्णय-सहाय्य प्लॅटफॉर्म (Decision Support System - DSS)** आहे. 

हा प्रकल्प आपत्ती व्यवस्थापन प्राधिकरण (Disaster Management Authorities), जिल्हाधिकारी कार्यालये आणि संशोधन विश्लेषकांसाठी धोकादायक क्षेत्रांची ओळख पटवून तेथील लोकसंख्येचे सुरक्षित ठिकाणी पुनर्वसन (Relocation) करण्याचे नियोजन करतो.

### ❓ हा प्रकल्प कोणत्या प्रश्नांची उत्तरे देतो?
1. **धोका कुठे आहे? (Where is the danger?)** → Multi-hazard विश्लेषण द्वारे.
2. **बाधित कोण होणार? (Who is vulnerable?)** → लोकसंख्या व सामाजिक-आर्थिक संवेदनशीलतेचे मूल्यांकन.
3. **धोका किती गंभीर आहे? (How serious is the risk?)** → Red Zone Scoring (GREEN, YELLOW, ORANGE, RED).
4. **सुरक्षित ठिकाणांची क्षमता किती आहे? (Can safer locations accommodate them?)** → Carrying Capacity Deficit/Surplus चाचणी.
5. **पुनर्वसन कुठे आणि कसे करावे? (Where should they relocate?)** → AI Greedy Nearest-Safe-Site Allocation.
6. **कोणाला प्रथम प्राधान्य द्यावे? (Who should be prioritized?)** → Priority Ranking Algorithm.

---

## 🛠️ २. तंत्रज्ञान (Tech Stack & Architecture)

| लेयर (Layer) | तंत्रज्ञान (Technology) | वर्णन (Description) |
|---|---|---|
| **Frontend UI** | React 18, Vite | जलद आणि रिॲक्टिव्ह युझर इंटरफेस |
| **Styling** | Tailwind CSS, Custom CSS | Modern Dashboard & UI Design |
| **Maps & GIS** | Leaflet, React-Leaflet | परस्परसंवादी नकाशा (Interactive GIS Mapping & Hotspots) |
| **Data Viz / Charts** | Recharts | आलेख आणि विश्लेषणात्मक डेटा व्हिज्युअलायझेशन |
| **Backend API** | Node.js, Express.js | RESTful API आणि analytical decision engines |
| **Database** | MongoDB + Mongoose / In-Memory Demo | Dual-mode: Mongo शिवाय इन-मेमरी चालतो किंवा MongoDB जोडता येते |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs | रोल-बेस्ड ॲक्सेस कंट्रोल (RBAC - 5 युझर रोल्स) |

---

## ⚙️ ३. मुख्य AI व विश्लेषणात्मक इंजिन्स (Core Analytical Engines)

प्रकल्पात ५ प्रमुख गणितीय/विश्लेषणात्मक इंजिन्स (Analytical Engines) समाविष्ट आहेत:

### 1️⃣ मल्टी-हॅझार्ड इंजिन (`hazards.js`)
* **१० विविध आपत्तींची नोंद व विश्लेषण:**
  - महापूर (Flood), भूस्खलन (Landslide), किनारपट्टी धूप (Coastal Erosion), ढगफुटी (Cloudburst), भूकंप (Earthquake), चक्रीवादळ (Cyclone), वणवा (Wildfire), दुष्काळ (Drought), उष्णतेची लाट (Heatwave), हिमस्खलन (Avalanche).

### 2️⃣ रिस्क व रेड-झोन इंजिन (`riskEngine.js`)
* **रिस्क स्कोर (0-100) सूत्र:**
  $$\text{Risk Score} = (0.32 \times \text{Hazard}) + (0.22 \times \text{Exposure}) + (0.18 \times \text{Vulnerability}) + (0.18 \times \text{Infrastructure Risk}) + (0.10 \times \text{Terrain Risk})$$
* **रेड झोन वर्गीकरण (Classification):**
  - 🟢 **GREEN (< 30):** कमी धोका (Low Risk)
  - 🟡 **YELLOW (30 – 54):** मध्यम धोका (Moderate Risk)
  - 🟠 **ORANGE (55 – 69):** उच्च धोका (High Risk)
  - 🔴 **RED (≥ 70):** अत्यंत गंभीर धोका (Critical / Very High Risk)
* **Recency & Intensity Boost:** मागील ५ वर्षांत ७ किंवा त्यापेक्षा जास्त तीव्रतेची घटना घडली असल्यास स्कोर आपोआप वाढतो.

### 3️⃣ व्हल्नरेबिलिटी इंजिन (`vulnerabilityEngine.js`)
* **संवेदनशीलता स्कोर (0–100):**
  - **Demographic Share:** वृद्ध, बालके, दिव्यांग लोकसंख्येचे प्रमाण.
  - **Infrastructure Deficit:** घरे, पिण्याचे पाणी, ड्रेनेज आणि स्वच्छता स्थिती.
  - **Accessibility & Services:** आपत्कालीन वैद्यकीय केंद्रांपासूनचे अंतर (km).
  - **Disaster History:** जुन्या आपत्तींचा इतिहास.

### 4️⃣ कॅरिंग कपॅसिटी इंजिन (`capacityEngine.js`)
* **सुरक्षित ठिकाणांची (Safe Sites) क्षमता तपासणी:**
  - कमाल क्षमता (Max Capacity) विरुद्ध सध्याचा वापर (Current Occupancy).
  - उपलब्ध क्षमता (Available Capacity) = $\text{Max Capacity} - \text{Occupancy}$.
  - तुटवडा/शिल्लक (Deficit/Surplus) मोजणे.
  - ८ संसाधनांचे मूल्यमापन: पिण्याचे पाणी, घरे, आरोग्य सुविधा, स्वच्छता, अन्न पुरवठा, रस्ते संपर्क, आपत्कालीन सेवा, निवारा.

### 5️⃣ रीलोकेशन वाटप इंजिन (`relocationEngine.js`)
* **Greedy Nearest-Safe-Site Algorithm:**
  1. वस्त्यांना रिस्क आणि संवेदनशीलतेनुसार **Priority Ranking** दिले जाते.
  2. उच्च प्राधान्य असलेल्या वस्त्यांना सर्वात जवळच्या (Haversine Distance) सुरक्षित ठिकाणी वाटप केले जाते.
  3. वाहतूक साधन (Road / Boat / Air) आणि लागणारा वेळ (ETA in minutes) मोजला जातो.

---

## 👥 ४. युझर रोल्स व परवानग्या (User Roles & Permissions)

सिस्टीममध्ये सुरक्षा आणि प्रशासनासाठी ५ स्तर (Roles) आहेत:

| रोल (Role) | ई-मेल | पासवर्ड | परवानग्या (Permissions) |
|---|---|---|---|
| **Admin** | `admin@bhudan.gov.in` | `Admin@12345` | पूर्ण सिस्टीम कंट्रोल, युझर मॅनेजमेंट |
| **Disaster Authority** | `collector@bhudan.gov.in` | `Disaster@12345` | रीलोकेशन प्लॅन मंजूर/नामंजूर करणे, रिजनल मॉनिटरिंग |
| **Analyst** | `analyst@bhudan.gov.in` | `Analyst@12345` | डेटा एडिट करणे, नवीन सुरक्षित जागा व वस्त्या जोडणे, प्लॅन जनरेट करणे |
| **Field Officer** | `field@bhudan.gov.in` | `Field@12345` | फील्ड डेटा अपडेट करणे, स्थिती नोंदवणे |
| **Viewer** | `viewer@bhudan.gov.in` | `Viewer@12345` | केवळ डेटा आणि नकाशे पाहणे (Read-Only) |

---

## 🖥️ ५. ॲप्लिकेशनचे मुख्य मॉड्यूल्स (Application Modules)

1. **Dashboard (मुख्य डॅशबोर्ड):**
   - संपूर्ण देशातील/जिल्ह्यातील रेड झोन, पिवळे झोन, एकूण बाधित लोकसंख्या आणि सुरक्षित ठिकाणांची आकडेवारी.
2. **GIS Map View (परस्परसंवादी नकाशा):**
   - वस्त्या (Habitations) व सुरक्षित ठिकाणे (Safe Sites) नकाशावर रंगीत मार्कर्सद्वारे दर्शवणे.
3. **Red Zones Panel (रेड झोन विश्लेषण):**
   - अत्यंत धोकादायक (RED & ORANGE) वस्त्यांची यादी व फिल्टरिंग.
4. **Habitation Management (वस्ती व्यवस्थापन):**
   - वस्त्यांची लोकसंख्या, भौगोलिक स्थाने, आपत्ती इतिहास आणि निकषांची माहिती.
5. **Safe Sites Management (सुरक्षित जागा व्यवस्थापन):**
   - निवारा केंद्रांची क्षमता, सध्याची लोकसंख्या आणि ८ भौतिक सुविधांचा आढावा.
6. **Carrying Capacity View (क्षमता मूल्यांकन):**
   - कोणत्या जिल्ह्यात सुरक्षित जागा पुरेशा आहेत की अपुऱ्या (Sufficient vs Insufficient) हे पाहणे.
7. **Relocation Planning (पुनर्वसन प्लॅनिंग व मान्यता):**
   - ऑटोमॅटिक रीलोकेशन प्लॅन तयार करणे, अंतर व वेळ मोजणे, आणि जिल्हाधिकाऱ्यांकडून प्लॅन अप्रूव्ह करून घेणे.
8. **Reports & Exports (अहवाल व डेटा निर्यात):**
   - PDF/CSV स्वरूपात अहवाल डाउनलोड करणे, विश्लेषणातील मर्यादा (Limitations) आणि विश्वासार्हता (Confidence Score) दर्शवणे.

---

## 💻 ६. लोकलहोस्टवर प्रकल्प चालवण्याची पद्धत (How to Run Locally)

### सर्व्हर सुरू करणे (Backend Server):
```bash
cd Bhudan/server
npm install
npm run dev
```
*(Backend चलू होईल: `http://localhost:5000`)*

### क्लायंट सुरू करणे (Frontend Client):
```bash
cd Bhudan/client
npm install
npm run dev
```
*(Frontend चालू होईल: `http://localhost:5173`)*

---

## 📡 ७. RESTful API एंडपॉइंट्स (API Reference)

* **ऑथेंटिकेशन (Auth):**
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/auth/demo`
* **डेटा व्यवस्थापन (Habitations & Sites):**
  - `GET /api/habitations` | `POST /api/habitations`
  - `GET /api/sites` | `POST /api/sites`
* **विश्लेषण (Analysis):**
  - `GET /api/analysis/district?district=Wayanad`
  - `GET /api/analysis/red-zones`
  - `GET /api/analysis/capacity`
  - `GET /api/analysis/relocation`
* **पुनर्वसन (Relocation Workflow):**
  - `POST /api/relocation/generate`
  - `PATCH /api/relocation/:id/status` (Approve/Reject)
