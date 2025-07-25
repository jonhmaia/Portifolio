#!/usr/bin/env python
import os
import struct

def compile_po_to_mo(po_file, mo_file):
    """Compile a .po file to .mo file"""
    
    # Read the .po file
    with open(po_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse the .po file
    entries = []
    lines = content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('#'):
            i += 1
            continue
            
        # Look for msgid
        if line.startswith('msgid '):
            msgid = line[6:].strip('"')
            i += 1
            
            # Handle multiline msgid
            while i < len(lines) and lines[i].strip().startswith('"'):
                msgid += lines[i].strip().strip('"')
                i += 1
            
            # Look for msgstr
            if i < len(lines) and lines[i].strip().startswith('msgstr '):
                msgstr = lines[i].strip()[7:].strip('"')
                i += 1
                
                # Handle multiline msgstr
                while i < len(lines) and lines[i].strip().startswith('"'):
                    msgstr += lines[i].strip().strip('"')
                    i += 1
                
                # Add entry if msgstr is not empty (msgid can be empty for header)
                if msgstr:
                    entries.append((msgid, msgstr))
        else:
            i += 1
    
    # Create .mo file
    keys = []
    values = []
    
    for msgid, msgstr in entries:
        keys.append(msgid.encode('utf-8'))
        values.append(msgstr.encode('utf-8'))
    
    # Calculate offsets
    koffsets = []
    voffsets = []
    kencoded = b''.join(keys)
    vencoded = b''.join(values)
    
    # Header
    keystart = 7 * 4 + 16 * len(keys)
    valuestart = keystart + len(kencoded)
    
    koffsets = []
    voffsets = []
    
    # Calculate key offsets
    offset = 0
    for key in keys:
        koffsets.append((len(key), keystart + offset))
        offset += len(key)
    
    # Calculate value offsets
    offset = 0
    for value in values:
        voffsets.append((len(value), valuestart + offset))
        offset += len(value)
    
    # Write .mo file
    with open(mo_file, 'wb') as f:
        # Magic number
        f.write(struct.pack('<I', 0x950412de))
        # Version
        f.write(struct.pack('<I', 0))
        # Number of entries
        f.write(struct.pack('<I', len(keys)))
        # Offset of key table
        f.write(struct.pack('<I', 7 * 4))
        # Offset of value table
        f.write(struct.pack('<I', 7 * 4 + 8 * len(keys)))
        # Hash table size
        f.write(struct.pack('<I', 0))
        # Offset of hash table
        f.write(struct.pack('<I', 0))
        
        # Key table
        for length, offset in koffsets:
            f.write(struct.pack('<I', length))
            f.write(struct.pack('<I', offset))
        
        # Value table
        for length, offset in voffsets:
            f.write(struct.pack('<I', length))
            f.write(struct.pack('<I', offset))
        
        # Keys
        f.write(kencoded)
        # Values
        f.write(vencoded)

if __name__ == '__main__':
    po_file = 'locale/en/LC_MESSAGES/django.po'
    mo_file = 'locale/en/LC_MESSAGES/django.mo'
    
    if os.path.exists(po_file):
        compile_po_to_mo(po_file, mo_file)
        print(f'Compiled {po_file} to {mo_file}')
    else:
        print(f'File {po_file} not found')