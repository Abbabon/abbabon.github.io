---
layout: post
title: Unity Shell - run command-line tasks from Unity
subtitle: yet another new package is born
tags: [unity, package, tools, utilities]
cover-img: /assets/img/posts/rmrf.png
share-img: /assets/img/posts/rmrf.png
share-img-twitter: /assets/img/posts/rmrf.png
comments: true
---

TL;DR - I forked a repository for a package that simplifies working with the command line in the Unity Editor, and made it more readable and available - [Unity Shell](https://github.com/Abbabon/UnityShell).

---

So recently I found myself in the fortunate position to develop new game infrastructures for our [mobile gaming studio](http://jellybuttongames.com/). I might elaborate on that in a series of posts in the future (and my 'might' promises are of course worth a lot judging by the history of this blog); but the basic premise of that infrastrure is this:

Open source package-oriented Unity projects.

That's it. You suspect something will be used in the future by other projects? Package it. Ship it. Use it. Pull-Request it. Change it. Publish it. That's my humble attempt at making slogans.

However. Open source, as I came to realise, is a lifestyle and a state of mind, and not one that's easy to get into. Some developers I work with has been having a hard time getting into some basic tools of the trade, for example - the command line, vi (or any shell-based code editor), and even command-line git. Let's call these developers Muggles, because they are ignorant of the magic that is shell commands.

Learning from git clients (like [github desktop](https://desktop.github.com/) or [octopus](https://octopus.com/)), a good UI can really encapsulate and most of the use-cases for command-line tools, making them more accessable. 

While I really like creating Unity editor tools using [Odin Inspector](https://bit.ly/36ZvtMn) (I really have to get to writing that post sometime...), it is a time-consuming task. So I tend to choose shortcuts whenever I can. And one 

# Running shell commands processes from code

C# has had the System.Diagnostics namespace for a long time, and [the Process class](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.process?view=net-6.0) which enables the user to control processes is one of its main superstars. This class:

> Provides access to local and remote processes and enables you to start and stop local system processes.

The downside of it, like many other earlier C# interfaces and classes, is that it's complex and somewhat arcane in places. My take on it is that it tries to do so many things and to be as generic as possible - in the cost of readability. 

I just want want to run stuff like `npm update` and `npm publish` and to get the result code. That's it. And maybe structure it like a task so I can hook it up with my other [UniTasks](https://github.com/Cysharp/UniTask).  The Muggles in project would love that.

After some googling, I managed to find [wigys8's](https://github.com/wlgys8/UnityShell) repository, which pretty much gave me all I needed. The problem is that it suffers from what I'd like to call **THE GRAVE SINS OF OPEN SOURCE REPOSITORIES**, which are:

1. Unclean code
2. Lacking documentation
3. Lack of accessibility

I could go on and on over each of those points, and we might do so in the future. The 1st one is usually the most painful one in the context of Unity packages, since many snippits you find online are designed to 'just work' when copy-pasted, rather than make sense in the context of a huge project. More often than not, I find repositories in a sorry state, with many static classes, Update methods with 500+ lines, short-named variables, nested classes, and many more things that will make Uncle Bob shrug in terror. 

So after forking, some gardening and consulting, I'm proud to introduce [Unity Shell](https://github.com/Abbabon/UnityShell), a lightweight package to run you shell commands with!

<p align="center"><a href="https://github.com/abbabon/unityshell"><img src="https://gh-card.dev/repos/abbabon/unityshell.svg" /></a></p>

## Running shell commands... NOT from code!
The original repository had an interesting idea I decided to implement in our project - it had 'presets' of commands as a scriptable object you can create for the Muggles in you dev team that knows how to work with Unity - but not why awk is awesome. You can write installers, symbol parsers, management utilities and more, without bothering with the `UnityEditor` namespace on the dreadful `OnGUI` loop. Here's the simplest of examples:

<p align="center"><img src="/assets/img/posts/Pasted_image_20220418155535.png"></p>

# Next Steps
* In the spirit of open source and accessability, upload the package to the awesome [OpenUPM](https://openupm.com/) project. This requires getting to know the package manitainane pipeline and maybe some more gardening. 
* I am considering to publish on the Unity Asset Store as well, maybe even with a paid version (which will include support, or some random bling), just to test the system and how it compares to OpenUPM / github in term of distribution, accessability and discoverability. 

<iframe src="https://assetstore.unity.com/linkmaker/embed/package/89041/widget-wide?aid=1100lfvqc" style="width:600px; height:130px; border:0px;"></iframe>
