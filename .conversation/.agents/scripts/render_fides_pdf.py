from pathlib import Path
import fitz
src = Path('attached_assets/Fides_Gate_-_Main_Slide_deck_1788279709876.pdf')
out = Path('.agents/outputs/fides_pdf_pages')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
print('pages', doc.page_count)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    dest = out / f'page-{i+1:02d}.png'
    pix.save(dest)
    print(dest, pix.width, pix.height)
