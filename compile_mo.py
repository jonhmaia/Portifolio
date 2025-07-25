#!/usr/bin/env python
import polib
import os

# Compile the django.po file to django.mo using polib
po_file = r'c:\Users\joaom\novo port\locale\en\LC_MESSAGES\django.po'
mo_file = r'c:\Users\joaom\novo port\locale\en\LC_MESSAGES\django.mo'

try:
    # Load the PO file
    po = polib.pofile(po_file)
    
    # Save as MO file
    po.save_as_mofile(mo_file)
    
    print(f"Successfully compiled {po_file} to {mo_file}")
    print(f"MO file exists: {os.path.exists(mo_file)}")
    
except Exception as e:
    print(f"Error compiling: {e}")
    import traceback
    traceback.print_exc()