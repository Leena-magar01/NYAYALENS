import docx
import os

sample_dir = os.path.join(os.path.dirname(__file__), "samples")
os.makedirs(sample_dir, exist_ok=True)
doc_path = os.path.join(sample_dir, "sample_nda_agreement.docx")

doc = docx.Document()
doc.add_heading('MUTUAL NON-DISCLOSURE AGREEMENT', 0)
doc.add_paragraph('This Non-Disclosure Agreement ("Agreement") is entered into on April 1, 2026, by and between Alpha Corp ("Disclosing Party") and Beta Solutions ("Receiving Party").')
doc.add_heading('1. CONFIDENTIAL INFORMATION', level=1)
doc.add_paragraph('Confidential Information refers to non-public technical, financial, or strategic business information disclosed by Disclosing Party.')
doc.add_heading('2. OBLIGATIONS & RESTRICTIONS', level=1)
doc.add_paragraph('Receiving Party shall hold all Confidential Information in strict confidence for 3 years following disclosure.')
doc.add_heading('3. TERMINATION & SURVIVAL', level=1)
doc.add_paragraph('Either party may terminate this Agreement with 30 days written notice. Obligations of confidentiality survive termination.')
doc.add_heading('4. DISPUTE RESOLUTION', level=1)
doc.add_paragraph('Disputes shall be settled under the laws of New Delhi, India.')

doc.save(doc_path)
print(f"Sample DOCX generated successfully at {doc_path}")
