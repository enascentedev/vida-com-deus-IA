import hashlib
import glob
import os

files = glob.glob("screenshots/imagens-readme/*.png")
hashes = {}
for f in files:
    with open(f, "rb") as fh:
        h = hashlib.md5(fh.read()).hexdigest()
    hashes.setdefault(h, []).append(os.path.basename(f))

dups = False
for lst in hashes.values():
    if len(lst) > 1:
        dups = True
        print("dup", lst)

if not dups:
    print("no duplicates")
