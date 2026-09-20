import os
import json
import re
from typing import List, Dict, Any

CATEGORIES = [
    "Parties",
    "Payment",
    "Dates",
    "Obligations",
    "Termination",
    "Renewal",
    "Penalties",
    "Liability",
    "Confidentiality",
    "Dispute Resolution",
    "Restrictions",
    "Other"
]

def compare_two_documents(
    doc_a_name: str,
    doc_a_clauses: List[Dict[str, Any]],
    doc_a_meta: Dict[str, Any],
    doc_b_name: str,
    doc_b_clauses: List[Dict[str, Any]],
    doc_b_meta: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compares Document A and Document B across 12 legal categories.
    Outputs:
    - side_by_side_matrix
    - key_differences
    - clauses_in_one_doc_only
    - changed_values
    - potential_inconsistencies
    - review_recommendations
    """
    # Group clauses by category
    def group_by_category(clauses):
        grouped = {}
        for c in clauses:
            cat = c.get("category", "Other")
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(c)
        return grouped

    a_grouped = group_by_category(doc_a_clauses)
    b_grouped = group_by_category(doc_b_clauses)

    side_by_side_matrix = []
    key_differences = []
    clauses_in_one_doc_only = []
    changed_values = []
    potential_inconsistencies = []
    review_recommendations = []

    # 1. Compare Parties
    a_parties = doc_a_meta.get("parties", ["Party A"])
    b_parties = doc_b_meta.get("parties", ["Party B"])
    side_by_side_matrix.append({
        "category": "Parties",
        "doc_a_value": ", ".join(a_parties),
        "doc_a_source": "Document A Header",
        "doc_b_value": ", ".join(b_parties),
        "doc_b_source": "Document B Header",
        "status": "Identical" if set(a_parties) == set(b_parties) else "Modified"
    })
    if set(a_parties) != set(b_parties):
        key_differences.append({
            "category": "Parties",
            "difference": f"Document A involves [{', '.join(a_parties)}] whereas Document B involves [{', '.join(b_parties)}].",
            "source_a": "Doc A Parties",
            "source_b": "Doc B Parties"
        })

    # 2. Compare Categories
    all_cats = list(set(list(a_grouped.keys()) + list(b_grouped.keys()) + CATEGORIES))
    
    for cat in sorted(all_cats):
        if cat == "Parties":
            continue

        a_list = a_grouped.get(cat, [])
        b_list = b_grouped.get(cat, [])

        if a_list and not b_list:
            clauses_in_one_doc_only.append({
                "category": cat,
                "document": doc_a_name,
                "clause_text": a_list[0]["original_text"][:250],
                "source": f"Doc A • Page {a_list[0].get('page_number', 1)} ({a_list[0].get('section_ref', 'General')})"
            })
            side_by_side_matrix.append({
                "category": cat,
                "doc_a_value": a_list[0]["simple_explanation"],
                "doc_a_source": f"Doc A • Page {a_list[0].get('page_number', 1)}",
                "doc_b_value": "Not Specified in Document B",
                "doc_b_source": "N/A",
                "status": "Present in Doc A Only"
            })
        elif b_list and not a_list:
            clauses_in_one_doc_only.append({
                "category": cat,
                "document": doc_b_name,
                "clause_text": b_list[0]["original_text"][:250],
                "source": f"Doc B • Page {b_list[0].get('page_number', 1)} ({b_list[0].get('section_ref', 'General')})"
            })
            side_by_side_matrix.append({
                "category": cat,
                "doc_a_value": "Not Specified in Document A",
                "doc_a_source": "N/A",
                "doc_b_value": b_list[0]["simple_explanation"],
                "doc_b_source": f"Doc B • Page {b_list[0].get('page_number', 1)}",
                "status": "Present in Doc B Only"
            })
        elif a_list and b_list:
            a_clause = a_list[0]
            b_clause = b_list[0]
            
            # Extract monetary / numeric values for changed values comparison
            a_text = a_clause["original_text"]
            b_text = b_clause["original_text"]

            a_nums = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', a_text)
            b_nums = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', b_text)

            is_modified = a_text.strip() != b_text.strip()

            if is_modified:
                key_differences.append({
                    "category": cat,
                    "difference": f"Document A specifies: \"{a_clause['simple_explanation']}\" whereas Document B specifies: \"{b_clause['simple_explanation']}\".",
                    "source_a": f"Doc A • Page {a_clause.get('page_number', 1)}",
                    "source_b": f"Doc B • Page {b_clause.get('page_number', 1)}"
                })

                if a_nums and b_nums and a_nums != b_nums:
                    changed_values.append({
                        "category": cat,
                        "field": f"{cat} Terms / Quantities",
                        "value_in_doc_a": ", ".join(a_nums[:2]),
                        "source_a": f"Doc A • Page {a_clause.get('page_number', 1)}",
                        "value_in_doc_b": ", ".join(b_nums[:2]),
                        "source_b": f"Doc B • Page {b_clause.get('page_number', 1)}"
                    })

                # Review recommendations (neutral non-judgmental wording)
                review_recommendations.append({
                    "category": cat,
                    "recommendation": f"Review variance in {cat.lower()} terms: Document A requires {a_clause['simple_explanation'][:80]} while Document B specifies {b_clause['simple_explanation'][:80]}.",
                    "why_review_matters": "Clarify which operational or financial term applies prior to execution.",
                    "source_ref_a": f"Doc A • Page {a_clause.get('page_number', 1)}",
                    "source_ref_b": f"Doc B • Page {b_clause.get('page_number', 1)}"
                })

            side_by_side_matrix.append({
                "category": cat,
                "doc_a_value": a_clause["simple_explanation"],
                "doc_a_source": f"Doc A • Page {a_clause.get('page_number', 1)} ({a_clause.get('section_ref', 'General')})",
                "doc_b_value": b_clause["simple_explanation"],
                "doc_b_source": f"Doc B • Page {b_clause.get('page_number', 1)} ({b_clause.get('section_ref', 'General')})",
                "status": "Modified" if is_modified else "Identical"
            })

    # 3. Check Potential Inconsistencies (e.g. conflicting notice periods or jurisdiction)
    for diff in key_differences:
        if any(k in diff["category"].lower() for k in ["dispute", "termination", "penalty"]):
            potential_inconsistencies.append({
                "title": f"Conflicting {diff['category']} Terms",
                "explanation": diff["difference"],
                "source_a": diff["source_a"],
                "source_b": diff["source_b"]
            })

    return {
        "doc_a_name": doc_a_name,
        "doc_b_name": doc_b_name,
        "summary": f"Comparison generated between '{doc_a_name}' and '{doc_b_name}'. Identified {len(key_differences)} key differences, {len(clauses_in_one_doc_only)} single-doc clauses, and {len(changed_values)} changed values.",
        "side_by_side_matrix": side_by_side_matrix,
        "key_differences": key_differences,
        "clauses_in_one_doc_only": clauses_in_one_doc_only,
        "changed_values": changed_values,
        "potential_inconsistencies": potential_inconsistencies,
        "review_recommendations": review_recommendations
    }
