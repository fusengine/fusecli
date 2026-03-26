# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 26-03-2026

### Fixed

- CLI version display reads from package.json instead of hardcoded 0.1.0

## [1.0.5] - 26-03-2026

### Added

- Fix plain text output for nested objects (no more [object Object])
- Verbose mode with > prefix for highlights/summary in generated CLIs
- `fusecli unlink` command (reverse of link — removes PATH and SKILL.md symlinks)
- Auto-sync package.json version from git tag in publish workflow

## [1.0.4] - 26-03-2026

### Documentation

- Update Quick Start with multiline commands and fusecli link step

## [1.0.3] - 26-03-2026

### Added

- npm publish config (@fusecli/api) with full metadata, keywords, and publishConfig
- GitHub Actions workflow for npm + GitHub Packages publishing with provenance
- packages/cli/README.md for npm package page
- packageManager field to root package.json for Turborepo
- ignoreDeprecations for TypeScript 6 compatibility

### Fixed

- Biome formatting issues in generators and IR modules
- noNonNullAssertion warnings in test files

### Maintenance

- Update @biomejs/biome to 2.4.9

## [1.0.2] - 2026-03-23

### Changed

- Restructure to Turborepo monorepo (packages/cli + apps/web)
- Update README badges and repo URL

## [1.0.1] - 2026-03-23

### Maintenance

- Add Apache 2.0 license and NOTICE with Fusengine attribution

## [1.0.0] - 2026-03-23

### Added

- OpenAPI 3.x spec parser with full schema resolution
- CLI generator producing standalone TypeScript CLIs
- Interactive prompts for required/optional parameters
- Support for path, query, header, and body parameters
- Modular architecture: parser, IR, generators, templates
- Handlebars templates for CLI output
- Comprehensive test suite with fixtures
- TypeScript strict mode throughout
