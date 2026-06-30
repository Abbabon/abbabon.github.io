---
title: Unity Shell
org: Open source
category: package · tools
image: "/assets/img/posts/rmrf.png"
store_url: "https://github.com/Abbabon"
store_label: View on GitHub
cta: View on GitHub
accent: green
order: 1
---

A lightweight Unity package that makes it painless to run command-line tasks
from inside the Editor. I forked an existing repo, cleaned up the code, wrote
real documentation, and shipped it as a proper UPM package.

```csharp
var result = await Shell.Run("npm publish");
```

The goal: open-source, package-oriented Unity projects where reusable
infrastructure gets packaged, shipped, and reused instead of copy-pasted.
