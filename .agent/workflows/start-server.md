---
description: Start the Next.js development server using the local Node environment
---

To start the development server correctly on this system, we must use the local Node.js installation and bypass PowerShell script execution policies.

// turbo
1. Set the PATH and start the server:
```powershell
$env:Path = "C:\Users\sapir\Desktop\stocksit2.0\tools\node-v22.13.0-win-x64;" + $env:Path; npm.cmd run dev
```

Alternatively, you can run the `dev.cmd` script in the root directory.
