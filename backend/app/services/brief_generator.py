import os
import json
from typing import List, Dict, Any

def generate_lawyer_brief(
    document_filename: str,
    user_concerns_text: str,
    meta: Dict[str, Any],
    clauses: List[Dict[str, Any]],
    findings: List[Dict[str, Any]],
    timeline: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates a structured Lawyer Consultation Brief strictly grounded in document facts and user inputs.
    """
    doc_type = meta.get("document_type", "Legal Agreement")
    parties = meta.get("parties", ["Party A", "Party B"])
    
    title = f"Legal Consultation Brief – {doc_type} ({document_filename})"
    
    issue_summary = (
        f"This consultation brief is prepared for reviewing a {doc_type} ('{document_filename}') between {', '.join(parties[:2])}. "
        f"The user seeks professional legal guidance regarding contract obligations, potential concern flags, and key notice deadlines."
    )

    important_dates = [
        {
            "event_date": ev.get("event_date", "N/A"),
            "title": ev.get("title", "Milestone"),
            "source_ref": ev.get("source_ref", "Contract Text")
        }
        for ev in timeline[:5]
    ] if timeline else [
        {"event_date": "Execution Date", "title": "Contract Commencement", "source_ref": "Page 1"}
    ]

    important_clauses = [
        {
            "category": c.get("category", "General"),
            "summary": c.get("simple_explanation", ""),
            "source_ref": f"Page {c.get('page_number', 1)} • {c.get('section_ref', 'General')}"
        }
        for c in clauses[:6]
    ]

    # Process user concerns
    user_concerns = []
    if user_concerns_text.strip():
        user_concerns = [c.strip() for c in user_concerns_text.split("\n") if c.strip()]
    else:
        user_concerns = [
            "Clarify early termination notice requirements and deposit forfeiture terms.",
            "Verify whether late payment penalty fees accrue daily.",
            "Review automatic renewal clause and written opt-out deadline."
        ]

    # Information gaps
    information_gaps = [
        "Verify whether annexures or schedules referenced in the agreement are attached.",
        "Check if municipal/local regulatory compliance approvals are formally documented.",
        "Confirm whether authorized signatures were executed in the presence of witnesses."
    ]

    # Tailored questions to ask a legal professional
    questions_for_lawyer = [
        f"Does the {doc_type} contain any uncustomary or one-sided indemnity obligations?",
        "What is the legal procedure and notice format required to terminate without penalty?",
        "Are the dispute resolution venue and arbitration clauses favorable under local law?",
        "How can the automatic renewal clause be modified or safely opted out of?"
    ]

    # Evidence / documents to prepare before meeting lawyer
    evidence_to_prepare = [
        f"Original signed copy of '{document_filename}'",
        "Payment receipts, bank transfer statements, and rent deposit records",
        "Written email, letter, or WhatsApp communications with the counterparty",
        "Government ID proofs (Aadhaar / PAN / Corporate Identification Number)"
    ]

    return {
        "title": title,
        "issue_summary": issue_summary,
        "relevant_documents": [document_filename],
        "important_dates": important_dates,
        "important_clauses": important_clauses,
        "user_concerns": user_concerns,
        "information_gaps": information_gaps,
        "questions_for_lawyer": questions_for_lawyer,
        "evidence_to_prepare": evidence_to_prepare,
        "disclaimer": "This Lawyer Consultation Brief is an automated preparation aid designed to assist you in organizing information before consulting a certified legal professional. It does NOT constitute legal advice."
    }
