# Domain-based project structure in Unity (reference note)

> **Internal note, not built by Jekyll.** `_reference/` is an underscore directory that is not a
> collection, so nothing here reaches the site. This is a study of an article Amit's posts cite
> repeatedly; pull TL;DRs and vocabulary from here rather than re-fetching the source.

**Source:** Gal Bartouv, *"Fighting Entropy In Unity, Structure based on Domains"*
<https://bartouv.github.io/articles/fighting-entropy-in-unity-structure-based-on-domains.html>
(category: Unity Dev, ~5 min read).

**Relation to Amit's work:** Gal was a teammate on **Card Kings** at Jelly Button (2020–2021).
Card Kings was the first Jelly Button project built on this structure *and* on dependency
injection from day one, rather than retrofitted. First post citing it:
`_posts/2026-09-07-card-kings.md`. Later posts about Merge Stories and architecture should link
the same article and reuse the vocabulary below (Company Core / Game Core / domain, asmdef,
Smurf naming).

---

## 1. The problem: structure by *type*

The default Unity layout groups assets by what they are, not what they are for:

```
<Animations>
<Audio>
<Fonts>
<Materials>
<Models>
<Plugins>
<Prefabs>
<Resources>
<Scenes>
<Scripts>
	<Commands>
	<Controlers>
	<Models>
	<Signals>
	<Views>
<Sprites>
<Textures>
```

Fine for a jam, and increasingly painful as the project grows. Folder structure is one of the
earliest decisions and one of the most expensive to change later.

### The eight symptoms Gal lists

1. **Complex project navigation** — a newcomer can't tell what the game *does* from the tree, nor
   where a new file belongs. Onboarding suffers.
2. **Code coupling (spaghetti)** — folders shape dependencies. With no domain boundary, everything
   references everything: merge conflicts across unrelated features, frequent regressions.
3. **Slow iterations** — Unity shines with multi-scene, additively-loaded workflows, but coupled
   code forces you to load the whole game to test one screen.
4. **Hard to discard features** — a feature's files are scattered, so nobody knows what's safe to
   delete. Either shared assets get nuked or dead code lingers forever.
5. **Fear of change** — touching a shared material/animation/sprite can break an unrelated
   feature; the dependency chain is invisible, so the bugs are wide and hard to detect.
6. **Hard to share code between projects** — nothing is decoupled enough to lift out.
7. **Hard to manage UI atlases** — without knowing where a sprite is used you can't build sane
   atlases: wrong sprites in wrong atlases → extra draw calls or loading unused texture memory.
8. **Not flexible to change** — the sum of the above: brittle, breaks often.

## 2. Requirements (the symptoms, inverted)

- Easy project navigation
- Decoupled code
- Fast iterations
- Easy feature removal
- Code shareable across projects
- Confident modification ("no fear of change")
- Manageable atlases
- Flexible architecture

## 3. The solution: structure by *domain*

A **domain** = one unified functional area (a feature, a service, a system). Assets are still
grouped by type *inside* each domain, but the top level is organised by domain. Three tiers,
with dependencies allowed to flow **downward only**:

| Tier | What lives there | May depend on |
|---|---|---|
| **1. Company Core** | Reusable systems useful in *any* project (e.g. an input-lock system). No project-specific knowledge. | nothing |
| **2. Game Core** | This game's shared services and the *interfaces* other domains talk through. | Company Core |
| **3. Inner game domains** | Feature-specific code and assets (the shop, the map, the loot minigame…). Can nest sub-domains as they grow. | Game Core, Company Core |

Folder tree from the article:

```
<CompanyCore>
	<Animations>
	<Audio>
	<Scripts>
	<Sprites>
	<Textures>
	<GameCore>
		<Animations>
		<Audio>
		<Scripts>
		<Sprites>
		<Textures>
		<SubDomains>
			<Domain1>
				<Animations>
				<Audio>
				<Scripts>
				<Sprites>
				<Textures>
				<SubDomains>
					<SubDomain1>
					<SubDomain2>
			<Domain2>
				<Animations>
				<Audio>
				<Scripts>
				<Sprites>
				<Textures>
```

### How domains interact

Sibling domains never reference each other directly. They talk through **interfaces that live in
Game Core**, and the **command pattern** keeps control flow unidirectional. Article example: an
*Update XP* command changes the experience value and, through a domain interface, triggers the
level-up popup — the XP domain never knows the popup domain exists.

### How to maintain it

- When a domain grows unwieldy, **split it into sub-domains**.
- When two sibling domains need the same asset, **hoist it up to their parent** rather than
  letting one depend on the other.
- It is a discipline, not a one-time setup.

### How to enforce it

- **Code: assembly definitions (asmdefs).** One per domain; a script in domain A literally cannot
  reference a script in domain B, because the reference doesn't compile. Violations become
  impossible instead of merely discouraged.
- **Assets: the "Smurf naming convention."** Prefix every asset with its domain,
  `Domain1_MaterialName`. Benefits: search by domain, and automation scripts can validate that an
  asset is only referenced from within its own domain.

## 4. Requirements, re-examined

| Requirement | How the structure delivers it |
|---|---|
| Easy navigation | The tree reads like a feature list. |
| Decoupled code | Asmdefs forbid cross-domain references. |
| Fast iterations | Each domain has its own scene(s); load one feature without the rest. |
| Easy to discard | Delete the domain folder; the only breakage is the Game Core access points. |
| No fear of change | A change inside a domain can only affect that domain and its sub-domains. |
| Manageable atlases | Asset placement reveals usage, so atlases follow domains. |
| Shareable code | Company Core has no project dependencies; copy it to the next game. |
| Flexible | All of the above compound. |

## 5. Gal's summary

Adopted on personal and enterprise projects; requires ongoing maintenance discipline; pays back
in faster development, less debugging and confident refactoring. The up-front architectural
investment "pays immediate dividends," letting developers spend energy on the game instead of
fighting the codebase.

---

## TL;DR to paste into posts (adapt wording each time)

- Organise the project by **domain** (feature), not by asset type.
- Three tiers: **Company Core → Game Core → feature domains**. Dependencies only point down.
- Sibling domains never reference each other; they talk through **interfaces in Game Core** and
  **commands**.
- **Assembly definitions** make an illegal reference a compile error, not a code-review note.
- **Smurf-name** assets (`Domain_AssetName`) so usage is greppable and lint-able.
- Deleting a feature = deleting a folder. Sharing a system = copying Company Core.

## Vocabulary to keep consistent across posts

Company Core · Game Core · domain / sub-domain · asmdef (assembly definition) · Smurf naming ·
command pattern · "dependencies flow downward" · "fighting entropy".
