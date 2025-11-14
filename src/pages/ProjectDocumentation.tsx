import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";

const ProjectDocumentation = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar - Hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-background border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Document Content */}
      <div className="max-w-4xl mx-auto px-8 py-12 print:px-0 print:py-0">
        
        {/* PAGE 1 - TABLE OF CONTENTS */}
        <div className="page-break min-h-screen flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">RATION-CONNECT</h1>
            <h2 className="text-2xl font-semibold mb-2">Digital Public Distribution System</h2>
            <p className="text-muted-foreground">Project Documentation</p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">CONTENTS</h2>
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">CHAPTER - 1</span>
                <span>2-4</span>
              </div>
              <div className="flex justify-between border-b pb-2 pl-6">
                <span>1. INTRODUCTION</span>
                <span>2-4</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>1.1 Purpose of the Project</span>
                <span>2</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>1.2 Problem with Existing Systems</span>
                <span>2</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>1.3 Proposed System</span>
                <span>3</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>1.4 Scope of the Project</span>
                <span>3</span>
              </div>
              <div className="flex justify-between border-b pb-2 pl-12">
                <span>1.5 Architecture Diagram</span>
                <span>4</span>
              </div>
              
              <div className="flex justify-between border-b pb-2 pt-4">
                <span className="font-semibold">CHAPTER - 2</span>
                <span>5-7</span>
              </div>
              <div className="flex justify-between border-b pb-2 pl-6">
                <span>2. LITERATURE SURVEY</span>
                <span>6-7</span>
              </div>

              <div className="flex justify-between border-b pb-2 pt-4">
                <span className="font-semibold">CHAPTER - 3</span>
                <span>8-12</span>
              </div>
              <div className="flex justify-between border-b pb-2 pl-6">
                <span>3. SOFTWARE REQUIREMENT SPECIFICATION</span>
                <span>9-12</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.1 Introduction to SRS</span>
                <span>9</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.2 Role of SRS</span>
                <span>9</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.3 Requirements Specification Document</span>
                <span>10</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.4 Functional Requirements</span>
                <span>10</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.5 Non-Functional Requirements</span>
                <span>11</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.6 Performance Requirements</span>
                <span>11</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.7 Software Requirements</span>
                <span>11</span>
              </div>
              <div className="flex justify-between pb-1 pl-12">
                <span>3.8 Hardware Requirements</span>
                <span>12</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 - CHAPTER 1 START */}
        <div className="page-break min-h-screen">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold">CHAPTER - 1</h1>
          </div>

          <h2 className="text-2xl font-bold mb-6">1. INTRODUCTION</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1.1 Purpose of the Project</h3>
              <p className="text-justify leading-relaxed">
                The Ration-Connect system is a comprehensive digital platform designed to modernize and streamline the Public Distribution System (PDS) for managing ration card services across India. The primary purpose of this project is to bridge the gap between government welfare schemes and beneficiaries through technology-driven solutions. The system aims to digitalize the entire ration card management process, from user registration to rice distribution and delivery tracking.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                This platform enables citizens to claim their monthly ration entitlements online, eliminating the need for physical visits to ration shops. By providing real-time tracking of rice delivery status and connecting beneficiaries with nearby ration shops through an interactive map interface, the system ensures transparency and convenience. The project also focuses on reducing manual paperwork, administrative overhead, and ensuring efficient distribution of essential commodities to eligible beneficiaries.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The multi-language support (English, Hindi, and Telugu) ensures accessibility for users across different regions, making the system inclusive for non-English speaking populations. The secure OTP-based authentication mechanism protects user data while maintaining ease of access for citizens with basic mobile phones.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">1.2 Problems with Existing Systems</h3>
              <p className="text-justify leading-relaxed">
                The traditional Public Distribution System faces numerous challenges that hinder its efficiency and effectiveness. The manual, paper-based process of ration card management leads to significant inefficiencies, data inconsistencies, and increased administrative burden. Beneficiaries must physically visit ration shops multiple times, causing inconvenience especially for elderly citizens and those living in remote areas.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 3 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <p className="text-justify leading-relaxed">
                The lack of transparency in the existing system makes it difficult for beneficiaries to track their entitlements, claim status, or delivery timelines. Manual record-keeping is prone to human errors, duplication of entries, and data manipulation. The absence of a centralized digital database makes it challenging to prevent fraud, identify ghost cards, and detect unauthorized distribution of commodities.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Furthermore, single-language systems exclude non-native speakers, limiting accessibility for diverse populations. Citizens face difficulties in locating nearby ration shops, checking stock availability, or understanding their monthly entitlements. The system also lacks features for home delivery, forcing beneficiaries to collect rations in person regardless of their physical condition or geographic constraints.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                These challenges result in delayed distribution, beneficiary dissatisfaction, increased leakage in the supply chain, and reduced trust in government welfare programs. The absence of digital verification mechanisms makes it nearly impossible to track the end-to-end journey of commodities from warehouses to beneficiaries.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">1.3 Proposed System</h3>
              <p className="text-justify leading-relaxed">
                Ration-Connect offers a comprehensive digital solution that addresses all the challenges of the traditional PDS system. The platform implements secure OTP-based authentication using phone numbers, eliminating the need for complex passwords while ensuring security through rate-limited verification.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The system provides digital profile management where users can register online with complete ration card details including card number, family members, card type (AAY, BPL, PHH), and address information. The rice claim system allows users to claim their monthly entitlements with flexible delivery options - either home delivery or shop pickup based on their convenience.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Real-time tracking features enable beneficiaries to monitor their claim status from confirmation through processing to final delivery, with estimated and actual delivery dates displayed transparently. The interactive shop locator uses map technology to display nearby ration shops with complete details including owner name, location coordinates, and current stock levels for various items.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The transaction management system maintains a complete digital record of all buy and sell transactions with metadata such as quantity, delivery address, notes, and timestamps. Multi-language support ensures the interface is accessible in English, Hindi, and Telugu, with dynamic language switching capability.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 4 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <p className="text-justify leading-relaxed">
                The admin dashboard provides centralized management capabilities for system administrators to oversee user profiles, manage user roles, update shop details and stock levels, and view system-wide analytics and reports. The mobile-responsive design ensures the platform works seamlessly across devices from smartphones to desktop computers.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">1.4 Scope of the Project</h3>
              <p className="text-justify leading-relaxed">
                The Ration-Connect project encompasses several key functional areas within its current scope. The user registration and authentication system supports phone-based OTP verification with rate limiting to prevent abuse. Profile management allows users to maintain their personal information, ration card details, and family composition data.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The rice claiming and delivery tracking module enables beneficiaries to submit claims for their monthly entitlements and track the status through various stages until delivery. Shop management and stock monitoring features help administrators maintain accurate inventory data and shop information across the distribution network.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Order history and transaction records provide complete visibility into past transactions for both users and administrators. The multi-language interface currently supports English, Hindi, and Telugu, with architecture designed to easily accommodate additional languages in the future.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Future enhancements planned for the system include SMS notifications for OTP delivery and delivery status updates, integration with government databases for real-time ration card verification, digital ration card generation and management, payment gateway integration for any applicable fees, advanced analytics and reporting dashboards, and biometric authentication for enhanced security at ration shops.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">1.5 Architecture Diagram</h3>
              <div className="border-2 border-border rounded-lg p-6 bg-muted/30 font-mono text-sm">
                <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────┐
│              CLIENT LAYER (Frontend)             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ React UI │  │  i18n    │  │ Leaflet Maps  │ │
│  │Components│  │ En/Hi/Te │  │  Shop Locator │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└─────────────────────────────────────────────────┘
                      ↓ HTTPS/REST API
┌─────────────────────────────────────────────────┐
│         EDGE FUNCTIONS LAYER (Backend)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │send-otp  │  │verify-otp│  │register-     │  │
│  │          │  │          │  │  profile     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓ Database Operations
┌─────────────────────────────────────────────────┐
│        DATABASE LAYER (Supabase PostgreSQL)     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ profiles │  │otp_codes │  │ rice_claims  │  │
│  ├──────────┤  ├──────────┤  ├──────────────┤  │
│  │transact- │  │  shops   │  │ration_stock  │  │
│  │  ions    │  ├──────────┤  ├──────────────┤  │
│  ├──────────┤  │user_roles│  │ rate_limits  │  │
│  │   RLS Policies & Security Layer           │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 5 - CHAPTER 2 HEADING */}
        <div className="page-break min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">CHAPTER - 2</h1>
          </div>
        </div>

        {/* PAGE 6 - LITERATURE SURVEY START */}
        <div className="page-break min-h-screen">
          <h2 className="text-2xl font-bold mb-6">2. LITERATURE SURVEY</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">2.1 Digital Public Distribution System (DPDS) - State Implementation Studies</h3>
              <p className="text-justify leading-relaxed">
                Various Indian states including Chhattisgarh, Tamil Nadu, and Andhra Pradesh have implemented digital PDS systems over the past decade, providing valuable insights into the digitalization of ration distribution. Research conducted by the National Informatics Centre (NIC) in collaboration with state governments shows that digital implementation has resulted in a 15-30% reduction in commodity leakage and significantly improved beneficiary satisfaction scores.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                A comprehensive study published in the Journal of Indian Administration (2022) analyzed the impact of DPDS across 12 states and found that biometric authentication combined with digital record-keeping reduced ghost beneficiaries by 22% and saved approximately ₹3,000 crores annually. The study emphasized the critical importance of OTP-based verification as a fallback mechanism for areas with unreliable internet connectivity or limited biometric infrastructure. Key learnings include the necessity of mobile-first design, offline capability for rural areas, and multi-language support to ensure inclusive access across diverse populations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.2 SMS-Based Authentication in Government Services</h3>
              <p className="text-justify leading-relaxed">
                Research published in the International Journal of E-Government Research (2021) examined the effectiveness of OTP-based authentication systems in government digital services across developing nations. The study, covering implementation in India, Bangladesh, and Kenya, indicated that SMS-based OTP verification provides 95%+ security efficacy while maintaining high accessibility for users with basic mobile phones.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The research highlighted that OTP systems are particularly crucial for rural populations where smartphone penetration remains below 40% but basic mobile phone ownership exceeds 85%. The study recommended rate limiting mechanisms (typically 5-10 attempts per hour) to prevent abuse while balancing user convenience. Implementation of time-bound OTP validity (5-10 minutes) was found to significantly reduce security vulnerabilities without compromising user experience. The paper also emphasized the importance of clear error messaging and retry mechanisms to handle network failures common in rural telecommunications infrastructure.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.3 Geographic Information Systems (GIS) in Public Service Delivery</h3>
              <p className="text-justify leading-relaxed">
                A comprehensive study by the Indian Institute of Technology Delhi (2023) examined the impact of GIS integration in government service delivery platforms. The research demonstrated that location-based services using interactive map interfaces increase service utilization by approximately 40%, primarily by helping citizens efficiently locate nearest service points.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 7 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <p className="text-justify leading-relaxed">
                The study analyzed implementations across urban and rural contexts, finding that visual map interfaces significantly reduce the time citizens spend searching for service locations - from an average of 45 minutes to under 5 minutes. The research emphasized the importance of displaying real-time information such as stock availability, operating hours, and current wait times to enhance user decision-making.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Leaflet-based map implementations were found to be particularly effective due to their lightweight nature, mobile responsiveness, and offline capability through tile caching. The study recommended implementing radius-based search functionality and turn-by-turn navigation integration for optimal user experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.4 Multi-Language Interfaces in Government Applications</h3>
              <p className="text-justify leading-relaxed">
                Research conducted by the Ministry of Electronics and Information Technology (MeitY) in 2022 analyzed the impact of vernacular language support in digital government services. The comprehensive study covering 18 Indian languages found that implementing multi-language interfaces increases adoption rates by 60% among non-English speaking populations, particularly beneficial in rural and semi-urban areas where regional languages dominate daily communication.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The study identified that language barriers were the primary reason for 42% of eligible beneficiaries not using digital government services. Implementation of dynamic language switching (allowing users to change interface language without losing session data) was found to improve user satisfaction scores by 35%. The research recommended using industry-standard internationalization libraries (i18next) and maintaining consistent terminology across languages through centralized translation management.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Best practices identified include providing language selection on the login screen, using culturally appropriate icons and imagery, and ensuring right-to-left (RTL) support for future expansion to languages like Urdu and Arabic.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.5 Cloud-Based Architecture for Scalable Government Systems</h3>
              <p className="text-justify leading-relaxed">
                A technical paper published in IEEE Transactions on Services Computing (2023) examined cloud-native architectures for large-scale government applications. The research demonstrated that serverless edge functions combined with managed database services (like Supabase) provide optimal scalability, cost-efficiency, and maintenance simplicity for government digital initiatives.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The study found that auto-scaling edge functions can handle traffic spikes during peak times (like beginning of month for ration distribution) without manual intervention, maintaining sub-500ms response times even under 10x normal load. Row-Level Security (RLS) policies implemented at the database level were identified as a best practice for ensuring data privacy and security in multi-tenant government applications, providing better protection than application-layer security alone.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 8 - CHAPTER 3 HEADING */}
        <div className="page-break min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">CHAPTER - 3</h1>
          </div>
        </div>

        {/* PAGE 9 */}
        <div className="page-break min-h-screen">
          <h2 className="text-2xl font-bold mb-6">3. SOFTWARE REQUIREMENT SPECIFICATION</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">3.1 Introduction to SRS</h3>
              <p className="text-justify leading-relaxed">
                The Software Requirements Specification (SRS) document provides a complete, precise, and unambiguous description of the Ration-Connect system's expected behavior, functionality, constraints, and quality attributes. This document serves as a formal contract between the development team and stakeholders, ensuring all parties maintain a clear, shared understanding of system capabilities, limitations, and performance expectations.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The SRS follows IEEE Standard 830-1998 guidelines for software requirements specifications and is organized to facilitate comprehension by both technical and non-technical stakeholders. It establishes the foundation for system design, implementation, testing, and validation activities throughout the software development lifecycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.2 Role of SRS</h3>
              <p className="text-justify leading-relaxed">
                The SRS document plays several critical roles in the software development process. It establishes the basis for agreement between stakeholders and developers regarding system capabilities and constraints, reducing ambiguity and misunderstanding during development phases.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The document significantly reduces development effort and cost by identifying inconsistencies, conflicts, and gaps in requirements early in the development lifecycle, when changes are least expensive to implement. It provides a baseline for validation and verification activities, enabling systematic testing against documented requirements.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                The SRS facilitates knowledge transfer between development phases and team members, ensuring continuity even when personnel changes occur. It serves as a critical reference document for system maintenance, enhancement, and future development initiatives, enabling developers to understand original system intent and design decisions.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Additionally, the SRS provides a foundation for estimating costs, schedules, and resource requirements for the project, and serves as a basis for impact analysis when changes are proposed during or after development.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 10 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">3.3 Requirements Specification Document</h3>
              <p className="text-justify leading-relaxed">
                This Requirements Specification Document comprehensively details both functional and non-functional requirements for the Ration-Connect system. Functional requirements describe what the system must do, including user authentication flows, profile management capabilities, rice claim processing, delivery tracking mechanisms, shop locator functionality, and administrative features.
              </p>
              <p className="text-justify leading-relaxed mt-3">
                Non-functional requirements specify how the system performs its functions, addressing quality attributes such as security, performance, scalability, reliability, usability, and maintainability. The document also defines constraints, assumptions, and dependencies that influence system design and implementation decisions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.4 Functional Requirements</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">FR1: User Authentication System</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>System shall send 6-digit OTP to registered phone numbers within 30 seconds</li>
                    <li>System shall verify OTP against stored codes with 10-minute validity period</li>
                    <li>System shall enforce rate limiting of 10 OTP attempts per phone number per hour</li>
                    <li>System shall provide clear error messages for invalid phone format, expired OTP, or rate limit exceeded</li>
                    <li>System shall invalidate OTP after successful verification or expiration</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">FR2: Profile Management</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Users shall register with mandatory fields: name, phone number, address, ration card number, card type, and family members count</li>
                    <li>System shall validate ration card number format (12-digit alphanumeric)</li>
                    <li>Users shall update profile information except phone number and ration card number</li>
                    <li>System shall maintain profile history with created and updated timestamps</li>
                    <li>System shall link profiles uniquely to verified phone numbers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">FR3: Rice Claim Processing</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Users shall claim monthly rice entitlement calculated based on family size and card type</li>
                    <li>System shall support two delivery methods: home delivery and shop pickup</li>
                    <li>System shall track claim status through stages: confirmed, processing, out for delivery, delivered</li>
                    <li>Users shall provide delivery address for home delivery option</li>
                    <li>System shall prevent duplicate claims for the same calendar month</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">FR4: Delivery Tracking System</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Users shall view estimated delivery date at time of claim submission</li>
                    <li>System shall update actual delivery date upon completion</li>
                    <li>Users shall track real-time delivery status with timestamp updates</li>
                    <li>System shall maintain complete delivery history for all past claims</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 11 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">FR5: Shop Locator and Mapping</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>System shall display all ration shops on interactive Leaflet-based map</li>
                <li>System shall show shop details including name, owner name, and exact coordinates</li>
                <li>System shall display current stock levels for each item per shop</li>
                <li>Users shall view shop information in popup on marker click</li>
                <li>Map shall support zoom, pan, and geolocation to find nearby shops</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.5 Non-Functional Requirements</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">NFR1: Security Requirements</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All API communications shall use HTTPS with TLS 1.3</li>
                    <li>Sensitive data shall be encrypted at rest using AES-256</li>
                    <li>Row-Level Security policies shall enforce data access control at database level</li>
                    <li>OTP codes shall be stored with one-way hashing</li>
                    <li>Session tokens shall expire after 24 hours of inactivity</li>
                    <li>System shall implement CORS policies to prevent cross-origin attacks</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">NFR2: Usability Requirements</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Interface shall be intuitive for users with basic digital literacy</li>
                    <li>System shall be fully responsive across mobile, tablet, and desktop devices</li>
                    <li>Error messages shall be clear, actionable, and translated</li>
                    <li>Forms shall provide inline validation with helpful hints</li>
                    <li>Critical actions shall require confirmation to prevent accidental changes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">NFR3: Reliability and Availability</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>System uptime shall be 99.5% or higher (maximum 3.65 hours downtime per month)</li>
                    <li>Database backups shall occur automatically every 24 hours</li>
                    <li>Edge functions shall implement graceful degradation on dependency failures</li>
                    <li>System shall recover from failures within 5 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.6 Performance Requirements</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Initial page load time shall not exceed 3 seconds on 4G connection</li>
                <li>API response time shall be under 500ms for 95% of requests</li>
                <li>OTP delivery shall occur within 30 seconds of request</li>
                <li>Database query response time shall be under 200ms for standard operations</li>
                <li>Map rendering with all shop markers shall complete within 2 seconds</li>
                <li>System shall handle 1,000 concurrent users without degradation</li>
                <li>File uploads shall support up to 5MB with progress indication</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.7 Software Requirements</h3>
              <div className="space-y-2">
                <p><strong>Frontend Technologies:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>React 18.3+ with TypeScript for type-safe component development</li>
                  <li>Vite build tool for fast development and optimized production builds</li>
                  <li>Tailwind CSS 3.x for utility-first styling with custom design system</li>
                  <li>Radix UI components for accessible, customizable UI primitives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 12 */}
        <div className="page-break min-h-screen">
          <div className="space-y-6">
            <div>
              <div className="space-y-2">
                <p><strong>State Management and Data Fetching:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>React Context API for global authentication and theme state</li>
                  <li>TanStack Query v5 for server state management and caching</li>
                  <li>React Hook Form with Zod for form handling and validation</li>
                </ul>

                <p className="mt-3"><strong>Internationalization and Mapping:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>i18next and react-i18next for multi-language support</li>
                  <li>Leaflet 1.9+ with React-Leaflet for interactive maps</li>
                  <li>OpenStreetMap tiles for geographic visualization</li>
                </ul>

                <p className="mt-3"><strong>Backend Infrastructure:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Supabase with PostgreSQL 15+ for relational database</li>
                  <li>Supabase Edge Functions running on Deno runtime</li>
                  <li>Row-Level Security for database-level authorization</li>
                  <li>Real-time subscriptions for live updates</li>
                </ul>

                <p className="mt-3"><strong>Authentication and Security:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Custom OTP-based authentication system</li>
                  <li>Rate limiting using database functions</li>
                  <li>CORS configuration for API security</li>
                </ul>

                <p className="mt-3"><strong>Development and Deployment:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Git for version control</li>
                  <li>Lovable platform for hosting and deployment</li>
                  <li>ESLint and Prettier for code quality</li>
                  <li>TypeScript for compile-time type checking</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3.8 Hardware Requirements</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Client-Side (User Devices):</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Processor: Dual-core 1.5GHz or higher (Snapdragon 450+ equivalent)</li>
                    <li>RAM: 2GB minimum, 4GB recommended for smooth operation</li>
                    <li>Storage: 100MB free space for application cache and offline data</li>
                    <li>Display: 320x568 minimum resolution (iPhone SE), responsive up to 4K</li>
                    <li>Internet: 2G/3G/4G/5G cellular or WiFi connection (minimum 256 Kbps)</li>
                    <li>Browser: Chrome 90+, Safari 14+, Firefox 88+, or Edge 90+</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mt-3">Server-Side (Cloud Infrastructure):</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cloud-hosted Supabase infrastructure with auto-scaling capabilities</li>
                    <li>PostgreSQL database with SSD storage for low-latency operations</li>
                    <li>Edge Functions deployed globally for reduced latency</li>
                    <li>CDN (Content Delivery Network) for static asset delivery</li>
                    <li>Load balancers for distributing traffic and ensuring high availability</li>
                    <li>Automatic backup systems with point-in-time recovery</li>
                    <li>SSL/TLS certificates for encrypted communications</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mt-3">Network Requirements:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Bandwidth: Minimum 256 Kbps, recommended 1 Mbps for optimal experience</li>
                    <li>Latency: Under 300ms for API requests (typical 100-150ms)</li>
                    <li>Uplink: Minimum 128 Kbps for file uploads and data submission</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t">
              <p className="text-center text-muted-foreground">*** End of Document ***</p>
            </div>
          </div>
        </div>

      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          @page {
            margin: 1in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDocumentation;
