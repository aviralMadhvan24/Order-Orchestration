import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path.cwd()
SRC = PROJECT_ROOT / "src"

BACKUP = PROJECT_ROOT / f"backup_before_ts_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

print("=" * 60)
print("NodeJS -> TypeScript Migration Tool")
print("=" * 60)

warnings = []

# -------------------------------------------------------
# Backup
# -------------------------------------------------------

print("\nCreating backup...")

if not BACKUP.exists():
    shutil.copytree(
        PROJECT_ROOT,
        BACKUP,
        ignore=shutil.ignore_patterns(
            "node_modules",
            ".git",
            "dist",
            "__pycache__",
            "*.pyc"
        )
    )

print("Backup created:")
print(BACKUP)


# -------------------------------------------------------
# Helpers
# -------------------------------------------------------

require_default = re.compile(
    r'const\s+(\w+)\s*=\s*require\(["\'](.+?)["\']\);?'
)

require_destruct = re.compile(
    r'const\s+\{([^}]+)\}\s*=\s*require\(["\'](.+?)["\']\);?'
)

module_exports = re.compile(
    r'module\.exports\s*=\s*'
)

exports_named = re.compile(
    r'exports\.(\w+)\s*='
)


def convert(content):

    # require()

    content = require_default.sub(
        r'import \1 from "\2";',
        content
    )

    content = require_destruct.sub(
        lambda m: f'import {{ {m.group(1).strip()} }} from "{m.group(2)}";',
        content
    )

    # module.exports

    content = module_exports.sub(
        'export default ',
        content
    )

    # exports.foo

    content = exports_named.sub(
        lambda m: f'export const {m.group(1)} =',
        content
    )

    return content


# -------------------------------------------------------
# Rename JS -> TS
# -------------------------------------------------------

print("\nConverting JS files...")

converted = 0

for root, dirs, files in os.walk(SRC):

    for file in files:

        if not file.endswith(".js"):
            continue

        old = Path(root) / file
        new = old.with_suffix(".ts")

        text = old.read_text(encoding="utf8")

        text = convert(text)

        new.write_text(text, encoding="utf8")

        old.unlink()

        converted += 1

print(f"{converted} files converted")


# -------------------------------------------------------
# Create folders
# -------------------------------------------------------

print("\nCreating folders...")

folders = [
    SRC / "publishers",
    SRC / "common",
    SRC / "prisma"
]

for f in folders:
    f.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------------
# Prisma client
# -------------------------------------------------------

prisma = SRC / "prisma" / "prisma.ts"

if not prisma.exists():

    prisma.write_text(
'''import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
''',
encoding="utf8"
    )

print("Prisma client created")


# -------------------------------------------------------
# tsconfig
# -------------------------------------------------------

tsconfig = PROJECT_ROOT / "tsconfig.json"

tsconfig.write_text(
'''{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    "rootDir": "./src",
    "outDir": "./dist",

    "strict": true,
    "esModuleInterop": true,

    "skipLibCheck": true,

    "resolveJsonModule": true,

    "sourceMap": true,

    "types": ["node"]
  },

  "include": ["src"]
}
''',
encoding="utf8"
)

print("tsconfig.json created")


# -------------------------------------------------------
# package.json
# -------------------------------------------------------

package = PROJECT_ROOT / "package.json"

if package.exists():

    pkg = json.loads(package.read_text())

    scripts = pkg.setdefault("scripts", {})

    scripts["dev"] = "tsx watch src/server.ts"
    scripts["build"] = "tsc"
    scripts["start"] = "node dist/server.js"

    package.write_text(
        json.dumps(pkg, indent=2)
    )

    print("package.json updated")

else:

    warnings.append("package.json not found")


# -------------------------------------------------------
# Rename imports
# -------------------------------------------------------

print("\nChecking imports...")

for root, dirs, files in os.walk(SRC):

    for file in files:

        if not file.endswith(".ts"):
            continue

        path = Path(root) / file

        text = path.read_text()

        # remove .js extension if present

        text = re.sub(
            r'from\s+"(.+?)\.js"',
            r'from "\1"',
            text
        )

        text = re.sub(
            r"from\s+'(.+?)\.js'",
            r"from '\1'",
            text
        )

        path.write_text(text)


# -------------------------------------------------------
# Report
# -------------------------------------------------------

print("\n" + "=" * 60)

print("Migration Complete")

print("=" * 60)

print(f"JS Files Converted : {converted}")

print(f"Backup             : {BACKUP}")

if warnings:

    print("\nWarnings:")

    for w in warnings:
        print("-", w)

print("\nNext Commands:\n")

print("npm install")
print("npm install -D typescript tsx ts-node @types/node")
print("npm install -D @types/express")
print("npx prisma generate")
print("npm run dev")

print("\nDone.")