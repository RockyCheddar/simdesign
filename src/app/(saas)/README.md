# AI-Powered Case Study SaaS Module (v2)

This directory (`(saas)`) and its nested routes/components represent the new, AI-powered Case Study SaaS offering. It is designed to be distinct from the original simulation system, focusing on generating, managing, and displaying simulated patient charts for healthcare instructors.

**Core Objective:**
To provide healthcare instructors and educational institutions with a streamlined solution for obtaining diverse, realistic, and customizable patient case studies for teaching and training. This addresses the pain point of time-consuming manual case creation and limited access to varied patient data.

**Key Features (Planned):**
- **Case Library:** A searchable and filterable repository of generated case studies.
- **On-Demand Case Creation:** Instructors can generate specific cases by providing parameters.
- **Bulk Case Generation:** Generate large quantities of cases based on category.
- **Interactive Case Display:** View cases with structured sections (demographics, clinical notes, labs, etc.).
- **In-App Editing:** Modify generated case details via a side drawer interface.
- **Multi-Format Export:** Download cases as PDFs, JSON, etc.

**Technical Foundation:**
- Built with Next.js (App Router) and TypeScript.
- Utilizes Tailwind CSS for a clean, modular UI.
- Integrates with AI models (e.g., Claude AI) for content generation.
- Will integrate with Supabase for persistent data storage (database, authentication, file storage).

**Styling & Modularity Note:**
New styles for this module are intentionally scoped and managed within this directory to prevent conflicts with the original simulation system's styles. 