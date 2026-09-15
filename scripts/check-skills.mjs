#!/usr/bin/env node
// Enforces the two invariants that fail silently.
//
// A SKILL.md whose `name` does not match its directory never registers, and a
// broken relative link is invisible until an agent follows it mid-task. Neither
// shows up in bun test, because neither is code. This is the lever that proves
// both, per the build-the-lever and encode-lessons-in-structure principles.
//
// Runs on node with no dependencies, so CI needs no install step to use it.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const failures = [];
const fail = (file, message) => failures.push({ file: relative(root, file), message });

// Skipped because a dependency's own README is full of links to files it did
// not ship, and those are not ours to fix.
const SKIP_DIRS = new Set(["node_modules", ".git"]);

function walk(dir, match, out = []) {
	if (!existsSync(dir)) return out;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory() && (SKIP_DIRS.has(entry.name) || entry.name.startsWith("."))) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, match, out);
		else if (match(entry.name)) out.push(full);
	}
	return out;
}

// Only the `name` field is read, so a line scan beats pulling in a YAML parser.
// Anything more structural would justify the dependency; this does not.
function frontmatterName(text) {
	if (!text.startsWith("---\n")) return { missing: "frontmatter" };
	const end = text.indexOf("\n---\n", 3);
	if (end === -1) return { missing: "closing ---" };
	const name = text
		.slice(4, end)
		.split("\n")
		.find((line) => line.startsWith("name:"));
	if (!name) return { missing: "name" };
	return { name: name.slice(5).trim().replace(/^["']|["']$/g, "") };
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const seen = new Map();

for (const file of [
	...walk(join(root, "skills"), (n) => n === "SKILL.md"),
	...walk(join(root, "agents"), (n) => n.endsWith(".md")),
]) {
	const { name, missing } = frontmatterName(readFileSync(file, "utf8"));
	if (missing) {
		fail(file, `missing ${missing}`);
		continue;
	}
	if (!KEBAB.test(name)) fail(file, `name "${name}" is not kebab-case, so it cannot be invoked as a slash command`);
	const isSkill = file.endsWith("SKILL.md");
	const dir = basenameOf(dirname(file));
	if (isSkill && dir !== name) fail(file, `name "${name}" does not match directory "${dir}", so the skill never registers`);
	const prior = seen.get(name);
	if (prior) fail(file, `name "${name}" is already used by ${relative(root, prior)}`);
	else seen.set(name, file);
}

function basenameOf(path) {
	const parts = path.split("/");
	return parts[parts.length - 1];
}

// A target is a path when it contains a separator or names a file. Bare words
// like the `[PR #123](url)` placeholder in why/references are prose, not links.
const isPath = (target) => target.includes("/") || /\.[a-z0-9]+$/i.test(target);

for (const file of [
	...walk(join(root, "skills"), (n) => n.endsWith(".md")),
	...walk(join(root, "agents"), (n) => n.endsWith(".md")),
	join(root, "README.md"),
]) {
	if (!existsSync(file)) continue;
	const text = readFileSync(file, "utf8");
	for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
		const target = match[1].split("#")[0].trim();
		if (!target || /^[a-z]+:/i.test(target) || !isPath(target)) continue;
		if (!existsSync(join(dirname(file), target))) fail(file, `broken link -> ${target}`);
	}
}

const checked = seen.size;
if (failures.length === 0) {
	console.log(`ok: ${checked} skills and agents, names and links all resolve`);
	process.exit(0);
}
console.error(`FAILED: ${failures.length} problem(s) across ${checked} components\n`);
for (const { file, message } of failures) console.error(`  ${file}\n    ${message}`);
process.exit(1);
