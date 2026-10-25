---
name: review-documents
description: 'Extract and review requirements and scanned meeting minutes in PDF form with the local Docling MCP server. Use when comparing project documents with implementation or preparing an engineering consistency review.'
---

# Review Project Documents

Use the local Docling MCP server to read `docs/requirements.pdf` and `docs/meeting-minutes.pdf` and identify testable claims about the product, its behavior, and intended architecture.

## Procedure

1. Convert each PDF separately with `docling/convert_document_into_docling_document`.
2. Get the document structure with `docling/get_overview_of_document_anchors`.
3. Search relevant terms and claims with `docling/search_for_text_in_document_anchors`. Use `docling/get_text_of_document_item_at_anchor` to read the complete relevant text and its surrounding context.
4. Review the full document structure when needed to find claims that a keyword search might miss. For scanned pages, treat OCR output as evidence with possible recognition errors; preserve page references and flag illegible or ambiguous text instead of guessing.
5. Record each relevant claim with its source document and page or anchor. Separate explicit requirements, decisions recorded in minutes, and unresolved or conflicting statements.

Keep extraction within the Docling workflow; do not write extracted text or intermediate files into the repository. Do not edit source PDFs. When invoked as part of the engineering review, return the sourced claims and uncertainty notes to the reviewer for inclusion in the combined report.
