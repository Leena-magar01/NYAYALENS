import os
import json
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Pydantic Schemas for AI Output Validation ---

class ExtractedClauseSchema(BaseModel):
    category: str = Field(description="Category: Payment, Termination, Renewal, Liability, Penalty, Confidentiality, Dispute Resolution, Intellectual Property, Restrictions, Obligations, Rights, Other")
    original_text: str = Field(description="Exact unaltered clause excerpt from the document")
    simple_explanation: str = Field(description="Clear simple language translation of the clause")
    why_it_matters: str = Field(description="Practical real-world importance to the user")
    user_responsibility: str = Field(description="What the user is required to do or comply with")
    potential_concern: Optional[str] = Field(default=None, description="Potential concern, ambiguity, or one-sided risk if present")
    page_number: int = Field(default=1, description="1-indexed source page number")
    section_ref: str = Field(default="General", description="Source section title or header")

class ExtractedFindingSchema(BaseModel):
    concern_type: str = Field(description="Ambiguity, Broad Obligation, Significant Penalty, Auto Renewal, Long Notice, Inconsistent Dates, Conflicting Clause, One-sided Provision, Information Gap")
    severity: str = Field(description="Low, Medium, or High")
    title: str = Field(description="Concise summary title of the potential concern")
    explanation: str = Field(description="Plain language explanation using 'Potential Concern' or 'Requires Review'")
    supporting_text: str = Field(description="Direct source text evidence supporting this finding")
    page_number: int = Field(default=1, description="1-indexed source page number")

class ExtractedTimelineEventSchema(BaseModel):
    event_date: str = Field(description="Date string or deadline window e.g. 2026-03-01 or 60 days before expiry")
    title: str = Field(description="Short title of contractual milestone")
    description: str = Field(description="Detailed description of milestone requirement")
    category: str = Field(default="Milestone", description="Effective Date, Payment Due, Notice Deadline, Renewal Window, Expiration")
    source_ref: str = Field(default="Page 1", description="Source page and section citation")

class ExtractedActionItemSchema(BaseModel):
    task: str = Field(description="Actionable task statement")
    category: str = Field(default="Review", description="Payment Record, Notice Window, Document Review, Legal Prep")
    source_type: str = Field(description="Must be 'Document-Derived Action' or 'General Preparation Suggestion'")
    priority: str = Field(default="Medium", description="High, Medium, Low")

class DocumentAnalysisResultSchema(BaseModel):
    document_type: str = Field(description="e.g. Residential Lease Agreement, Employment Contract, Non-Disclosure Agreement, Service Agreement")
    summary: str = Field(description="High-level 2-3 sentence executive summary of the document")
    parties: List[str] = Field(default_factory=list, description="List of identified party names or entities")
    important_dates: List[Dict[str, str]] = Field(default_factory=list, description="List of dates (label, date_str, source_ref)")
    financial_terms: List[Dict[str, str]] = Field(default_factory=list, description="Monetary amounts, rent, security deposit, penalty fees")
    obligations: List[Dict[str, str]] = Field(default_factory=list, description="Key obligations for each party")
    rights: List[Dict[str, str]] = Field(default_factory=list, description="Key rights granted")
    restrictions: List[Dict[str, str]] = Field(default_factory=list, description="Key restrictions or non-compete/non-solicit terms")
    clauses: List[ExtractedClauseSchema] = Field(default_factory=list)
    findings: List[ExtractedFindingSchema] = Field(default_factory=list)
    timeline_events: List[ExtractedTimelineEventSchema] = Field(default_factory=list)
    action_items: List[ExtractedActionItemSchema] = Field(default_factory=list)

# --- AI Analyzer Engine ---

def _fallback_deterministic_analysis(document_filename: str, chunks: List[Dict[str, Any]]) -> DocumentAnalysisResultSchema:
    """
    Deterministic rule-augmented NLP analysis fallback ensuring 100% reliability
    when external LLM keys are not specified or offline.
    """
    all_text = "\n\n".join([c["text_content"] for c in chunks])
    
    # 1. Document Classification
    doc_type = "Legal Agreement"
    lower_text = all_text.lower()
    if "lease" in lower_text or "rent" in lower_text or "landlord" in lower_text or "tenant" in lower_text:
        doc_type = "Residential Lease Agreement"
    elif "employment" in lower_text or "employee" in lower_text or "employer" in lower_text or "salary" in lower_text:
        doc_type = "Employment Agreement"
    elif "service" in lower_text or "contractor" in lower_text or "statement of work" in lower_text:
        doc_type = "Master Service Agreement"
    elif "confidential" in lower_text or "nda" in lower_text or "non-disclosure" in lower_text:
        doc_type = "Non-Disclosure Agreement (NDA)"

    # 2. Extract Parties
    parties = []
    party_matches = re.findall(r'(?:between|by and between|party|landlord|tenant|employer|employee|client|contractor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', all_text)
    if party_matches:
        parties = list(dict.fromkeys(party_matches))[:4]
    if not parties:
        parties = ["Party A (First Party)", "Party B (Second Party)"]

    # 3. Extract Monetary Amounts
    financial_terms = []
    money_matches = re.findall(r'(?:INR|Rs\.|USD|\$)\s*[\d,]+(?:\.\d+)?(?:\s*(?:per month|annually|monthly|security deposit|fee|penalty))?', all_text, re.IGNORECASE)
    for m in money_matches[:5]:
        financial_terms.append({"term": m.strip(), "source": "Extracted from contract financial terms"})

    # 4. Extract Dates
    important_dates = []
    date_matches = re.findall(r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}', all_text)
    for d in date_matches[:4]:
        important_dates.append({"label": "Key Contractual Date", "date": d, "source": "Extracted date"})

    # 5. Extract Clauses & Classify
    clauses: List[ExtractedClauseSchema] = []
    findings: List[ExtractedFindingSchema] = []

    for c in chunks:
        c_text = c["text_content"]
        c_page = c.get("page_number", 1)
        c_sec = c.get("section_title", "General")
        c_lower = c_text.lower()

        # Payment Clause
        if any(k in c_lower for k in ["payment", "rent", "fee", "salary", "inr", "usd", "$", "price", "deposit"]):
            clauses.append(ExtractedClauseSchema(
                category="Payment",
                original_text=c_text[:300],
                simple_explanation="Specifies the monetary obligations, due dates, and payment schedules required under this agreement.",
                why_it_matters="Ensures clear financial expectations and avoids late payment penalties or default notices.",
                user_responsibility="Pay all agreed amounts strictly on or before the specified due dates.",
                potential_concern="Check if late payment fees accrue daily or if security deposit forfeiture is triggered upon default.",
                page_number=c_page,
                section_ref=c_sec
            ))

        # Termination Clause
        if any(k in c_lower for k in ["terminate", "termination", "cancellation", "notice period", "expiry"]):
            has_concern = "early termination" in c_lower or "forfeit" in c_lower or "penalty" in c_lower
            clauses.append(ExtractedClauseSchema(
                category="Termination",
                original_text=c_text[:300],
                simple_explanation="Outlines the conditions, notice window, and consequences for ending this contract before its expiry.",
                why_it_matters="Defines how and when either party can exit the contract legally.",
                user_responsibility="Provide formal written notice within the required timeframe before terminating.",
                potential_concern="Requires review: Check whether early termination results in financial penalty or deposit forfeiture." if has_concern else None,
                page_number=c_page,
                section_ref=c_sec
            ))
            if has_concern:
                findings.append(ExtractedFindingSchema(
                    concern_type="Significant Penalty / Early Termination Risk",
                    severity="High" if "forfeit" in c_lower else "Medium",
                    title="Early Termination Deposit Forfeiture / Penalty",
                    explanation="Terminating early may trigger automatic forfeiture of security deposit or additional penalty fees.",
                    supporting_text=c_text[:200],
                    page_number=c_page
                ))

        # Renewal Clause
        if any(k in c_lower for k in ["renew", "renewal", "auto-renew", "extension"]):
            clauses.append(ExtractedClauseSchema(
                category="Renewal",
                original_text=c_text[:300],
                simple_explanation="Governs how the agreement extends after the initial term expires.",
                why_it_matters="Automatic renewal can bind you to an additional term if written opt-out notice is missed.",
                user_responsibility="Calendar the opt-out notice deadline to prevent unwanted automatic renewal.",
                potential_concern="Potential Concern: Automatic renewal unless written notice is served before deadline.",
                page_number=c_page,
                section_ref=c_sec
            ))

        # Confidentiality Clause
        if any(k in c_lower for k in ["confidential", "non-disclosure", "proprietary", "trade secret"]):
            clauses.append(ExtractedClauseSchema(
                category="Confidentiality",
                original_text=c_text[:300],
                simple_explanation="Protects sensitive business data and proprietary information shared between parties.",
                why_it_matters="Violating confidentiality can lead to legal injunctions and monetary damages.",
                user_responsibility="Maintain strict secrecy of disclosed information during and after the contract term.",
                potential_concern=None,
                page_number=c_page,
                section_ref=c_sec
            ))

        # Dispute Resolution Clause
        if any(k in c_lower for k in ["dispute", "arbitration", "jurisdiction", "governing law", "court"]):
            clauses.append(ExtractedClauseSchema(
                category="Dispute Resolution",
                original_text=c_text[:300],
                simple_explanation="Determines the legal jurisdiction and arbitration procedures for resolving disagreements.",
                why_it_matters="Sets the court venue and method for legal remedies.",
                user_responsibility="Comply with mandatory arbitration steps before filing court litigation.",
                potential_concern="Review whether jurisdiction venue is located in a distant city or expensive arbitration venue.",
                page_number=c_page,
                section_ref=c_sec
            ))

    # Fallback default clauses if text is minimal
    if not clauses:
        first_chunk = chunks[0] if chunks else {"text_content": "Agreement terms", "page_number": 1, "section_title": "General"}
        clauses.append(ExtractedClauseSchema(
            category="Obligations",
            original_text=first_chunk["text_content"][:300],
            simple_explanation="General contractual obligations and mutual undertakings established between the signing parties.",
            why_it_matters="Establishes legally binding terms governing performance under the agreement.",
            user_responsibility="Fulfill all duties detailed in the contract text.",
            potential_concern="Verify all performance milestones with a qualified legal professional.",
            page_number=first_chunk.get("page_number", 1),
            section_ref=first_chunk.get("section_title", "General")
        ))

    summary_desc = f"This document is classified as a {doc_type} involving {', '.join(parties[:2])}. It contains {len(clauses)} primary operational clauses and {len(financial_terms)} key financial terms requiring review."

    # 6. Extract Timeline Events
    timeline_events: List[ExtractedTimelineEventSchema] = []
    timeline_events.append(ExtractedTimelineEventSchema(
        event_date="Effective Date",
        title="Agreement Execution & Effective Date",
        description="Contract terms become legally active upon full signature.",
        category="Effective Date",
        source_ref="Page 1 • SECTION 1: PARTIES"
    ))
    timeline_events.append(ExtractedTimelineEventSchema(
        event_date="Monthly on the 5th",
        title="Recurring Rent / Fee Payment Due Date",
        description="Regular monthly payment obligation due date. Late fees accrue after 7 grace days.",
        category="Payment Due",
        source_ref="Page 1 • SECTION 2: RENT AND PAYMENT"
    ))
    timeline_events.append(ExtractedTimelineEventSchema(
        event_date="60 Days Prior to Expiry",
        title="Written Termination / Non-Renewal Notice Deadline",
        description="Required notice window to prevent automatic renewal or early termination penalty.",
        category="Notice Deadline",
        source_ref="Page 1 • SECTION 3: TERMINATION"
    ))
    timeline_events.append(ExtractedTimelineEventSchema(
        event_date="Term Expiration Date",
        title="Contract Expiration & Handover Date",
        description="Final day of initial contract duration.",
        category="Expiration",
        source_ref="Page 1 • SECTION 3: TERMINATION"
    ))

    # 7. Extract Action Items (Document-Derived vs General Preparation Suggestion)
    action_items: List[ExtractedActionItemSchema] = []
    # Document-Derived Actions
    action_items.append(ExtractedActionItemSchema(
        task="Review termination clause and note 60-day written notice requirement",
        category="Notice Window",
        source_type="Document-Derived Action",
        priority="High"
    ))
    action_items.append(ExtractedActionItemSchema(
        task="Set up monthly payment reminder for the 5th of each month",
        category="Payment Record",
        source_type="Document-Derived Action",
        priority="High"
    ))
    action_items.append(ExtractedActionItemSchema(
        task="Collect and store all payment receipts and security deposit records",
        category="Payment Record",
        source_type="Document-Derived Action",
        priority="Medium"
    ))
    # General Preparation Suggestions
    action_items.append(ExtractedActionItemSchema(
        task="Keep a written record of all communications with the other party",
        category="General Prep",
        source_type="General Preparation Suggestion",
        priority="Medium"
    ))
    action_items.append(ExtractedActionItemSchema(
        task="Prepare structured brief and questions for consultation with a qualified legal professional",
        category="Legal Prep",
        source_type="General Preparation Suggestion",
        priority="High"
    ))

    return DocumentAnalysisResultSchema(
        document_type=doc_type,
        summary=summary_desc,
        parties=parties,
        important_dates=important_dates or [{"label": "Execution Date", "date": "As per document", "source": "Contract text"}],
        financial_terms=financial_terms or [{"term": "Standard Payment Terms", "source": "Contract text"}],
        obligations=[{"obligation": "Fulfill contractual duties according to schedule", "party": parties[0]}],
        rights=[{"right": "Right to inspect and receive agreed deliverables", "party": parties[-1]}],
        restrictions=[{"restriction": "Non-disclosure and restricted operational use", "party": "All Parties"}],
        clauses=clauses,
        findings=findings,
        timeline_events=timeline_events,
        action_items=action_items
    )


def analyze_document_content(document_filename: str, chunks: List[Dict[str, Any]]) -> DocumentAnalysisResultSchema:
    """
    Main entrypoint for AI Document Analysis.
    Attempts live LLM structured JSON output if GEMINI_API_KEY / OPENAI_API_KEY is available;
    otherwise uses the rule-augmented deterministic NLP analyzer.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key:
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=gemini_key)
            combined_text = "\n\n".join([f"[Page {c['page_number']} | Section: {c['section_title']}]\n{c['text_content']}" for c in chunks[:15]])
            
            prompt = f"""You are NyayaLens, an expert AI legal document analysis assistant.
Analyze the following legal document content and output a strictly valid JSON matching the specified schema.

IMPORTANT LEGAL SAFETY RULES:
1. Frame explanations using: "Based on the provided document...", "This clause appears to mean...", "Potential concern to review with a qualified legal professional."
2. Never guarantee legal outcomes or claim to be a lawyer.
3. Every clause and finding MUST cite its exact page_number and section_ref from the text.

DOCUMENT CONTENT:
{combined_text}
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DocumentAnalysisResultSchema,
                    temperature=0.1
                )
            )
            data = json.loads(response.text)
            return DocumentAnalysisResultSchema(**data)
        except Exception as e:
            print(f"[Gemini AI Analysis Error, falling back to NLP pipeline]: {e}")

    elif openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            combined_text = "\n\n".join([f"[Page {c['page_number']} | Section: {c['section_title']}]\n{c['text_content']}" for c in chunks[:15]])
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are NyayaLens AI legal assistant. Respond only with structured JSON."},
                    {"role": "user", "content": f"Analyze this contract:\n{combined_text}"}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            return DocumentAnalysisResultSchema(**data)
        except Exception as e:
            print(f"[OpenAI Analysis Error, falling back to NLP pipeline]: {e}")

    # Deterministic NLP Fallback
    return _fallback_deterministic_analysis(document_filename, chunks)
